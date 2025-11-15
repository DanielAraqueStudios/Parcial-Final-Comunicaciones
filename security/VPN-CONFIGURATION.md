# Configuración VPN Site-to-Site

## Topología VPN

```
Sede 1-8 ←→ Hub Central (Bogotá) ←→ AWS Cloud
(IPsec)         (IPsec)                (IPsec)
```

## IPsec con StrongSwan

### Instalación (Ubuntu/Debian)
```bash
apt update
apt install strongswan strongswan-pki libcharon-extra-plugins
```

### Configuración Hub Central (Bogotá)

#### /etc/ipsec.conf
```conf
config setup
  charondebug="ike 2, knl 2, cfg 2"
  uniqueids=no

# Conexión con Tunja
conn tunja-to-bogota
  type=tunnel
  authby=secret
  left=10.0.128.1  # IP pública Bogotá
  leftsubnet=10.0.128.0/19
  right=200.1.1.10  # IP pública Tunja
  rightsubnet=10.0.0.0/19
  ike=aes256-sha256-modp2048!
  esp=aes256-sha256-modp2048!
  keyingtries=%forever
  auto=start
  dpdaction=restart
  dpddelay=30s

# Repetir para las 8 sedes...

# Conexión con AWS
conn aws-vpc
  type=tunnel
  authby=secret
  left=10.0.128.1
  leftsubnet=10.0.0.0/16
  right=54.xxx.xxx.xxx  # AWS VPN Gateway
  rightsubnet=172.31.0.0/16
  ike=aes256-sha256-modp2048!
  esp=aes256-sha256-modp2048!
  keyingtries=%forever
  auto=start
```

#### /etc/ipsec.secrets
```conf
# PSK para cada sede
200.1.1.10 10.0.128.1 : PSK "TunjaSecureKey2025!@#$"
200.1.2.10 10.0.128.1 : PSK "DuitamaSecureKey2025!@#$"
# ... continuar para 8 sedes

# AWS VPN
54.xxx.xxx.xxx 10.0.128.1 : PSK "AWSSecureKey2025!@#$"
```

### Configuración Spoke (Tunja)

#### /etc/ipsec.conf
```conf
conn tunja-to-bogota
  type=tunnel
  authby=secret
  left=200.1.1.10  # IP pública Tunja
  leftsubnet=10.0.0.0/19
  right=10.0.128.1  # IP pública Bogotá
  rightsubnet=10.0.0.0/16  # Acceso a toda la red
  ike=aes256-sha256-modp2048!
  esp=aes256-sha256-modp2048!
  keyingtries=%forever
  auto=start
  dpdaction=restart
```

## Comandos de Gestión

```bash
# Iniciar IPsec
systemctl start strongswan

# Ver estado de túneles
ipsec status

# Ver estadísticas
ipsec statusall

# Reiniciar túnel específico
ipsec down tunja-to-bogota
ipsec up tunja-to-bogota

# Ver logs en tiempo real
tail -f /var/log/syslog | grep charon
```

## Firewall Rules (iptables)

```bash
# Permitir IPsec
iptables -A INPUT -p udp --dport 500 -j ACCEPT   # IKE
iptables -A INPUT -p udp --dport 4500 -j ACCEPT  # NAT-T
iptables -A INPUT -p esp -j ACCEPT               # ESP

# NAT para VPN
iptables -t nat -A POSTROUTING -s 10.0.0.0/16 -o eth0 -j MASQUERADE

# Forward entre subnets
iptables -A FORWARD -s 10.0.0.0/16 -d 10.0.0.0/16 -j ACCEPT
```

## Backup LTE/5G

### Configuración Failover
```bash
# /etc/network/if-up.d/vpn-failover
#!/bin/bash

PRIMARY_GW="10.0.7.4"
BACKUP_GW="192.168.100.1"  # Modem LTE

ping -c 3 $PRIMARY_GW > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Primary link down, switching to LTE..."
  ip route del default
  ip route add default via $BACKUP_GW
  systemctl restart strongswan
fi
```

## Monitoreo

```bash
# Script de monitoreo continuo
#!/bin/bash
while true; do
  for sede in tunja duitama sogamoso; do
    ipsec status ${sede}-to-bogota | grep "ESTABLISHED"
    if [ $? -ne 0 ]; then
      echo "ALERT: Túnel $sede caído" | mail -s "VPN Alert" admin@agricultura.com
    fi
  done
  sleep 60
done
```

## AWS VPN Gateway

### Configuración AWS Site-to-Site VPN
```bash
# Crear Customer Gateway (desde Bogotá)
aws ec2 create-customer-gateway \
  --type ipsec.1 \
  --public-ip 10.0.128.1 \
  --bgp-asn 65000

# Crear VPN Connection
aws ec2 create-vpn-connection \
  --type ipsec.1 \
  --customer-gateway-id cgw-xxxxx \
  --vpn-gateway-id vgw-xxxxx \
  --options TunnelOptions='[{PreSharedKey=AWSSecureKey2025}]'
```

### Descargar Configuración
```bash
aws ec2 describe-vpn-connections \
  --vpn-connection-ids vpn-xxxxx \
  --query 'VpnConnections[0].CustomerGatewayConfiguration' \
  --output text > aws-vpn-config.xml
```

## Rendimiento y Optimización

| Parámetro | Valor Recomendado |
|-----------|-------------------|
| MTU | 1400 (para evitar fragmentación) |
| IKE Lifetime | 86400s (24h) |
| IPsec Lifetime | 3600s (1h) |
| DPD Delay | 30s |
| Throughput Esperado | 100-500 Mbps |
