# Arquitectura MQTT - Sistema IoT Agroindustrial

## Topología de Topics MQTT

### Estructura Jerárquica

```
agricultura/
├── {sede}/
│   ├── sensores/
│   │   ├── {sensor_id}/
│   │   │   ├── temperatura
│   │   │   ├── humedad
│   │   │   └── presion
│   ├── rfid/
│   │   ├── {lector_id}/
│   │   │   ├── lectura
│   │   │   └── estado
│   ├── camaras/
│   │   └── {camara_id}/estado
│   ├── riego/
│   │   ├── {zona_id}/
│   │   │   ├── comando
│   │   │   └── estado
│   └── gateway/
│       └── {gateway_id}/estado
```

## Topics por Sede - Ejemplos

### Tunja
```
agricultura/tunja/sensores/sensor-001/temperatura
agricultura/tunja/sensores/sensor-001/humedad
agricultura/tunja/rfid/lector-bodega-01/lectura
agricultura/tunja/riego/zona-campo-a/comando
agricultura/tunja/riego/zona-campo-a/estado
```

### Bogotá (Central)
```
agricultura/bogota/sensores/sensor-050/temperatura
agricultura/bogota/rfid/lector-central-01/lectura
agricultura/central/alertas/criticas
agricultura/central/reportes/diarios
```

## Configuración Mosquitto Broker

### mosquitto.conf (Por Sede)

```conf
# Identificación del broker
broker_id broker_tunja_01

# Puertos
listener 1883 10.0.6.21
protocol mqtt

listener 8883 10.0.6.21
protocol mqtt
cafile /etc/mosquitto/certs/ca.crt
certfile /etc/mosquitto/certs/server.crt
keyfile /etc/mosquitto/certs/server.key
require_certificate true

# WebSocket para dashboard
listener 9001 10.0.6.21
protocol websockets

# Persistencia
persistence true
persistence_location /var/lib/mosquitto/
persistence_file mosquitto.db
autosave_interval 300

# Logs
log_dest file /var/log/mosquitto/mosquitto.log
log_type all
log_timestamp true

# Control de acceso
allow_anonymous false
password_file /etc/mosquitto/passwd
acl_file /etc/mosquitto/acl.conf

# Limits
max_connections 1000
max_queued_messages 1000
message_size_limit 256000
```

## QoS por Tipo de Mensaje

| Tipo | QoS | Razón |
|------|-----|-------|
| Telemetría sensores | 1 | Balance confiabilidad/performance |
| Lecturas RFID | 2 | Datos críticos trazabilidad |
| Comandos riego | 2 | No perder comandos críticos |
| Estados dispositivos | 0 | Updates frecuentes |
| Alertas | 2 | Garantizar entrega |

## Payload JSON Estándar

### Sensor Temperatura/Humedad
```json
{
  "device_id": "sensor-tunja-001",
  "timestamp": "2025-11-15T10:30:45Z",
  "sede": "tunja",
  "location": {"lat": 5.5349, "lon": -73.3624},
  "readings": {
    "temperatura": 24.5,
    "humedad": 65.2,
    "presion": 1013.25
  },
  "battery": 87,
  "signal_strength": -65
}
```

### Lectura RFID
```json
{
  "reader_id": "rfid-tunja-bodega-01",
  "timestamp": "2025-11-15T10:31:12Z",
  "sede": "tunja",
  "rfid_tags": [
    {
      "tag_id": "E200001234567890ABCD1234",
      "rssi": -45,
      "producto": "Tomate",
      "lote": "LOT-2025-1115-001"
    }
  ]
}
```

## Bridge a AWS IoT Core

### Bridge Config
```conf
# Conexión a AWS IoT Core
connection awsiot
address a3xxxxxxx.iot.us-east-1.amazonaws.com:8883
bridge_protocol_version mqttv311
remote_clientid tunja-gateway-01
bridge_cafile /etc/mosquitto/certs/AmazonRootCA1.pem
bridge_certfile /etc/mosquitto/certs/device.crt
bridge_keyfile /etc/mosquitto/certs/device.key

# Topics a reenviar
topic agricultura/tunja/# out 1 "" agricultura/tunja/
topic agricultura/tunja/comandos/# in 1 "" agricultura/tunja/comandos/

# Opciones
try_private false
cleansession true
notifications true
start_type automatic
```

## Comandos Útiles

```bash
# Publicar mensaje test
mosquitto_pub -h 10.0.6.21 -p 8883 \
  --cafile ca.crt --cert client.crt --key client.key \
  -t "agricultura/tunja/sensores/test/temperatura" \
  -m '{"value":25.3}'

# Suscribirse a todos los topics de una sede
mosquitto_sub -h 10.0.6.21 -p 8883 \
  --cafile ca.crt --cert client.crt --key client.key \
  -t "agricultura/tunja/#" -v

# Monitorear QoS y estadísticas
watch -n 1 'mosquitto_sub -h localhost -p 1883 -t "$SYS/#"'
```
