# Gestión de Certificados TLS/SSL

## Jerarquía de Certificados

```
CA Raíz (Root CA)
└── CA Intermedia - Agricultura IoT
    ├── Certificados de Servidor
    │   ├── MQTT Brokers (8 sedes)
    │   ├── Servidores API
    │   └── Gateways LoRa
    └── Certificados de Cliente
        ├── Sensores IoT (1000+)
        ├── Lectores RFID
        └── Dispositivos Edge
```

## Creación de CA Privada

### 1. Root CA
```bash
# Generar clave privada Root CA
openssl genrsa -aes256 -out root-ca.key 4096

# Crear certificado Root CA (10 años)
openssl req -x509 -new -nodes -key root-ca.key \
  -sha256 -days 3650 -out root-ca.crt \
  -subj "/C=CO/ST=Cundinamarca/L=Bogota/O=Agricultura IoT/CN=Root CA"
```

### 2. Intermediate CA
```bash
# Generar clave privada Intermediate CA
openssl genrsa -out intermediate-ca.key 4096

# CSR para Intermediate CA
openssl req -new -key intermediate-ca.key \
  -out intermediate-ca.csr \
  -subj "/C=CO/ST=Cundinamarca/O=Agricultura IoT/CN=Intermediate CA"

# Firmar con Root CA (5 años)
openssl x509 -req -in intermediate-ca.csr \
  -CA root-ca.crt -CAkey root-ca.key -CAcreateserial \
  -out intermediate-ca.crt -days 1825 -sha256 \
  -extfile <(echo "basicConstraints=CA:TRUE")
```

## Certificados de Servidor

### MQTT Broker (Por Sede)
```bash
# Tunja MQTT Broker
openssl genrsa -out mqtt-tunja.key 2048

openssl req -new -key mqtt-tunja.key \
  -out mqtt-tunja.csr \
  -subj "/C=CO/O=Agricultura IoT/CN=mqtt.tunja.local"

# Firmar con Intermediate CA
openssl x509 -req -in mqtt-tunja.csr \
  -CA intermediate-ca.crt -CAkey intermediate-ca.key \
  -CAcreateserial -out mqtt-tunja.crt -days 365 -sha256 \
  -extfile <(cat <<EOF
subjectAltName = DNS:mqtt.tunja.local, IP:10.0.6.21
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
EOF
)
```

## Certificados de Cliente (Sensores)

### Generación Masiva
```bash
#!/bin/bash
# generate-sensor-certs.sh

SEDE="tunja"
for i in {1..100}; do
  SENSOR_ID=$(printf "sensor-%s-%03d" "$SEDE" "$i")
  
  openssl genrsa -out "devices/${SENSOR_ID}.key" 2048
  
  openssl req -new -key "devices/${SENSOR_ID}.key" \
    -out "devices/${SENSOR_ID}.csr" \
    -subj "/C=CO/O=Agricultura IoT/CN=${SENSOR_ID}"
  
  openssl x509 -req -in "devices/${SENSOR_ID}.csr" \
    -CA intermediate-ca.crt -CAkey intermediate-ca.key \
    -CAcreateserial -out "devices/${SENSOR_ID}.crt" \
    -days 730 -sha256
done
```

## Configuración Mosquitto con TLS

### mosquitto.conf
```conf
# Puerto TLS
listener 8883
protocol mqtt

# Certificados servidor
cafile /etc/mosquitto/certs/ca-chain.crt
certfile /etc/mosquitto/certs/mqtt-tunja.crt
keyfile /etc/mosquitto/certs/mqtt-tunja.key

# Mutual TLS (autenticación cliente)
require_certificate true
use_identity_as_username true

# TLS versión y cifrados
tls_version tlsv1.3
ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
```

## Validación y Testing

```bash
# Verificar certificado
openssl x509 -in mqtt-tunja.crt -text -noout

# Test conexión TLS
openssl s_client -connect 10.0.6.21:8883 \
  -CAfile ca-chain.crt \
  -cert sensor-tunja-001.crt \
  -key sensor-tunja-001.key

# Test MQTT con TLS
mosquitto_pub -h 10.0.6.21 -p 8883 \
  --cafile ca-chain.crt \
  --cert sensor-tunja-001.crt \
  --key sensor-tunja-001.key \
  -t "test/tls" -m "Conexión segura OK"
```

## Renovación Automática

### Script de Renovación
```bash
#!/bin/bash
# renew-certificates.sh

# Buscar certificados que vencen en 30 días
find /etc/mosquitto/certs -name "*.crt" | while read cert; do
  EXPIRY=$(openssl x509 -enddate -noout -in "$cert" | cut -d= -f2)
  EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
  NOW_EPOCH=$(date +%s)
  DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))
  
  if [ $DAYS_LEFT -lt 30 ]; then
    echo "Renovando $cert (vence en $DAYS_LEFT días)"
    # Lógica de renovación...
  fi
done
```

## AWS IoT Core Certificates

### Registro de Dispositivo
```bash
# Crear certificado en AWS IoT
aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile sensor-001.crt \
  --public-key-outfile sensor-001.public.key \
  --private-key-outfile sensor-001.private.key

# Adjuntar política
aws iot attach-policy \
  --policy-name "AgriculturaIoTPolicy" \
  --target "arn:aws:iot:us-east-1:ACCOUNT_ID:cert/CERT_ID"
```

## Almacenamiento Seguro

- **Root CA Key**: HSM o bóveda física offline
- **Intermediate CA Key**: Servidor seguro con acceso restringido
- **Server Keys**: Protegidos con permisos 600, root only
- **Client Keys**: Embebidos en dispositivos (TPM si disponible)

## Revocación (CRL)

```bash
# Revocar certificado comprometido
openssl ca -revoke devices/sensor-tunja-050.crt \
  -keyfile intermediate-ca.key \
  -cert intermediate-ca.crt

# Generar CRL
openssl ca -gencrl \
  -keyfile intermediate-ca.key \
  -cert intermediate-ca.crt \
  -out crl.pem

# Distribuir CRL a brokers MQTT
scp crl.pem root@10.0.6.21:/etc/mosquitto/certs/
```
