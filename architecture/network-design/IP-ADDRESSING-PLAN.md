# Plan de Direccionamiento IP - Sistema IoT Agroindustrial

## Red Principal: 10.0.0.0/16

### Diseño de Subnetting para 8 Sedes

Cada sede tiene un bloque /19 (8,190 hosts disponibles) para permitir crecimiento futuro.

---

## SEDE 1 - TUNJA (Boyacá)
**Red Principal**: `10.0.0.0/19` → Rango: 10.0.0.1 - 10.0.31.254

### Segmentación por VLANs

| VLAN | Nombre | Red | Máscara | Gateway | Rango IPs | Hosts | Uso |
|------|--------|-----|---------|---------|-----------|-------|-----|
| 10 | Sensores-Tunja | 10.0.0.0/22 | 255.255.252.0 | 10.0.0.1 | 10.0.0.2 - 10.0.3.254 | 1022 | Sensores ambientales (humedad, temp, presión) |
| 20 | RFID-Tunja | 10.0.4.0/24 | 255.255.255.0 | 10.0.4.1 | 10.0.4.2 - 10.0.4.254 | 253 | Lectores RFID en bodegas |
| 30 | Camaras-Tunja | 10.0.5.0/24 | 255.255.255.0 | 10.0.5.1 | 10.0.5.2 - 10.0.5.254 | 253 | Cámaras IP vigilancia |
| 40 | Edge-Tunja | 10.0.6.0/27 | 255.255.255.224 | 10.0.6.1 | 10.0.6.2 - 10.0.6.30 | 29 | Gateways LoRa, servidores edge |
| 50 | Gestion-Tunja | 10.0.7.0/28 | 255.255.255.240 | 10.0.7.1 | 10.0.7.2 - 10.0.7.14 | 13 | Switches, routers, equipos de red |
| 60 | Usuarios-Tunja | 10.0.8.0/23 | 255.255.254.0 | 10.0.8.1 | 10.0.8.2 - 10.0.9.254 | 509 | PCs, tablets, smartphones oficina |

---

## SEDE 2 - DUITAMA (Boyacá)
**Red Principal**: `10.0.32.0/19` → Rango: 10.0.32.1 - 10.0.63.254

### Segmentación por VLANs

| VLAN | Nombre | Red | Máscara | Gateway | Rango IPs | Hosts | Uso |
|------|--------|-----|---------|---------|-----------|-------|-----|
| 10 | Sensores-Duitama | 10.0.32.0/22 | 255.255.252.0 | 10.0.32.1 | 10.0.32.2 - 10.0.35.254 | 1022 | Sensores ambientales |
| 20 | RFID-Duitama | 10.0.36.0/24 | 255.255.255.0 | 10.0.36.1 | 10.0.36.2 - 10.0.36.254 | 253 | Lectores RFID |
| 30 | Camaras-Duitama | 10.0.37.0/24 | 255.255.255.0 | 10.0.37.1 | 10.0.37.2 - 10.0.37.254 | 253 | Cámaras IP |
| 40 | Edge-Duitama | 10.0.38.0/27 | 255.255.255.224 | 10.0.38.1 | 10.0.38.2 - 10.0.38.30 | 29 | Gateways, servidores edge |
| 50 | Gestion-Duitama | 10.0.39.0/28 | 255.255.255.240 | 10.0.39.1 | 10.0.39.2 - 10.0.39.14 | 13 | Equipos de red |
| 60 | Usuarios-Duitama | 10.0.40.0/23 | 255.255.254.0 | 10.0.40.1 | 10.0.40.2 - 10.0.41.254 | 509 | Usuarios oficina |

---

## SEDE 3 - SOGAMOSO (Boyacá)
**Red Principal**: `10.0.64.0/19` → Rango: 10.0.64.1 - 10.0.95.254

### Segmentación por VLANs

| VLAN | Nombre | Red | Máscara | Gateway | Rango IPs | Hosts | Uso |
|------|--------|-----|---------|---------|-----------|-------|-----|
| 10 | Sensores-Sogamoso | 10.0.64.0/22 | 255.255.252.0 | 10.0.64.1 | 10.0.64.2 - 10.0.67.254 | 1022 | Sensores ambientales |
| 20 | RFID-Sogamoso | 10.0.68.0/24 | 255.255.255.0 | 10.0.68.1 | 10.0.68.2 - 10.0.68.254 | 253 | Lectores RFID |
| 30 | Camaras-Sogamoso | 10.0.69.0/24 | 255.255.255.0 | 10.0.69.1 | 10.0.69.2 - 10.0.69.254 | 253 | Cámaras IP |
| 40 | Edge-Sogamoso | 10.0.70.0/27 | 255.255.255.224 | 10.0.70.1 | 10.0.70.2 - 10.0.70.30 | 29 | Gateways, servidores edge |
| 50 | Gestion-Sogamoso | 10.0.71.0/28 | 255.255.255.240 | 10.0.71.1 | 10.0.71.2 - 10.0.71.14 | 13 | Equipos de red |
| 60 | Usuarios-Sogamoso | 10.0.72.0/23 | 255.255.254.0 | 10.0.72.1 | 10.0.72.2 - 10.0.73.254 | 509 | Usuarios oficina |

---

## SEDE 4 - CHIQUINQUIRÁ (Boyacá)
**Red Principal**: `10.0.96.0/19` → Rango: 10.0.96.1 - 10.0.127.254

### Segmentación por VLANs

| VLAN | Nombre | Red | Máscara | Gateway | Rango IPs | Hosts | Uso |
|------|--------|-----|---------|---------|-----------|-------|-----|
| 10 | Sensores-Chiquinquira | 10.0.96.0/22 | 255.255.252.0 | 10.0.96.1 | 10.0.96.2 - 10.0.99.254 | 1022 | Sensores ambientales |
| 20 | RFID-Chiquinquira | 10.0.100.0/24 | 255.255.255.0 | 10.0.100.1 | 10.0.100.2 - 10.0.100.254 | 253 | Lectores RFID |
| 30 | Camaras-Chiquinquira | 10.0.101.0/24 | 255.255.255.0 | 10.0.101.1 | 10.0.101.2 - 10.0.101.254 | 253 | Cámaras IP |
| 40 | Edge-Chiquinquira | 10.0.102.0/27 | 255.255.255.224 | 10.0.102.1 | 10.0.102.2 - 10.0.102.30 | 29 | Gateways, servidores edge |
| 50 | Gestion-Chiquinquira | 10.0.103.0/28 | 255.255.255.240 | 10.0.103.1 | 10.0.103.2 - 10.0.103.14 | 13 | Equipos de red |
| 60 | Usuarios-Chiquinquira | 10.0.104.0/23 | 255.255.254.0 | 10.0.104.1 | 10.0.104.2 - 10.0.105.254 | 509 | Usuarios oficina |

---

## SEDE 5 - BOGOTÁ (Cundinamarca) - CENTRAL
**Red Principal**: `10.0.128.0/19` → Rango: 10.0.128.1 - 10.0.159.254

### Segmentación por VLANs

| VLAN | Nombre | Red | Máscara | Gateway | Rango IPs | Hosts | Uso |
|------|--------|-----|---------|---------|-----------|-------|-----|
| 10 | Sensores-Bogota | 10.0.128.0/22 | 255.255.252.0 | 10.0.128.1 | 10.0.128.2 - 10.0.131.254 | 1022 | Sensores ambientales |
| 20 | RFID-Bogota | 10.0.132.0/24 | 255.255.255.0 | 10.0.132.1 | 10.0.132.2 - 10.0.132.254 | 253 | Lectores RFID |
| 30 | Camaras-Bogota | 10.0.133.0/24 | 255.255.255.0 | 10.0.133.1 | 10.0.133.2 - 10.0.133.254 | 253 | Cámaras IP |
| 40 | Edge-Bogota | 10.0.134.0/27 | 255.255.255.224 | 10.0.134.1 | 10.0.134.2 - 10.0.134.30 | 29 | Gateways, servidores edge |
| 45 | Servidores-Central | 10.0.135.0/25 | 255.255.255.128 | 10.0.135.1 | 10.0.135.2 - 10.0.135.126 | 125 | Servidores centrales, DB |
| 50 | Gestion-Bogota | 10.0.136.0/28 | 255.255.255.240 | 10.0.136.1 | 10.0.136.2 - 10.0.136.14 | 13 | Equipos de red |
| 60 | Usuarios-Bogota | 10.0.137.0/22 | 255.255.252.0 | 10.0.137.1 | 10.0.137.2 - 10.0.140.254 | 1022 | Usuarios oficina central |
| 70 | DMZ-Bogota | 10.0.141.0/27 | 255.255.255.224 | 10.0.141.1 | 10.0.141.2 - 10.0.141.30 | 29 | Servidores públicos |

---

## SEDE 6 - ZIPAQUIRÁ (Cundinamarca)
**Red Principal**: `10.0.160.0/19` → Rango: 10.0.160.1 - 10.0.191.254

### Segmentación por VLANs

| VLAN | Nombre | Red | Máscara | Gateway | Rango IPs | Hosts | Uso |
|------|--------|-----|---------|---------|-----------|-------|-----|
| 10 | Sensores-Zipaquira | 10.0.160.0/22 | 255.255.252.0 | 10.0.160.1 | 10.0.160.2 - 10.0.163.254 | 1022 | Sensores ambientales |
| 20 | RFID-Zipaquira | 10.0.164.0/24 | 255.255.255.0 | 10.0.164.1 | 10.0.164.2 - 10.0.164.254 | 253 | Lectores RFID |
| 30 | Camaras-Zipaquira | 10.0.165.0/24 | 255.255.255.0 | 10.0.165.1 | 10.0.165.2 - 10.0.165.254 | 253 | Cámaras IP |
| 40 | Edge-Zipaquira | 10.0.166.0/27 | 255.255.255.224 | 10.0.166.1 | 10.0.166.2 - 10.0.166.30 | 29 | Gateways, servidores edge |
| 50 | Gestion-Zipaquira | 10.0.167.0/28 | 255.255.255.240 | 10.0.167.1 | 10.0.167.2 - 10.0.167.14 | 13 | Equipos de red |
| 60 | Usuarios-Zipaquira | 10.0.168.0/23 | 255.255.254.0 | 10.0.168.1 | 10.0.168.2 - 10.0.169.254 | 509 | Usuarios oficina |

---

## SEDE 7 - FACATATIVÁ (Cundinamarca)
**Red Principal**: `10.0.192.0/19` → Rango: 10.0.192.1 - 10.0.223.254

### Segmentación por VLANs

| VLAN | Nombre | Red | Máscara | Gateway | Rango IPs | Hosts | Uso |
|------|--------|-----|---------|---------|-----------|-------|-----|
| 10 | Sensores-Facatativa | 10.0.192.0/22 | 255.255.252.0 | 10.0.192.1 | 10.0.192.2 - 10.0.195.254 | 1022 | Sensores ambientales |
| 20 | RFID-Facatativa | 10.0.196.0/24 | 255.255.255.0 | 10.0.196.1 | 10.0.196.2 - 10.0.196.254 | 253 | Lectores RFID |
| 30 | Camaras-Facatativa | 10.0.197.0/24 | 255.255.255.0 | 10.0.197.1 | 10.0.197.2 - 10.0.197.254 | 253 | Cámaras IP |
| 40 | Edge-Facatativa | 10.0.198.0/27 | 255.255.255.224 | 10.0.198.1 | 10.0.198.2 - 10.0.198.30 | 29 | Gateways, servidores edge |
| 50 | Gestion-Facatativa | 10.0.199.0/28 | 255.255.255.240 | 10.0.199.1 | 10.0.199.2 - 10.0.199.14 | 13 | Equipos de red |
| 60 | Usuarios-Facatativa | 10.0.200.0/23 | 255.255.254.0 | 10.0.200.1 | 10.0.200.2 - 10.0.201.254 | 509 | Usuarios oficina |

---

## SEDE 8 - FUSAGASUGÁ (Cundinamarca)
**Red Principal**: `10.0.224.0/19` → Rango: 10.0.224.1 - 10.0.255.254

### Segmentación por VLANs

| VLAN | Nombre | Red | Máscara | Gateway | Rango IPs | Hosts | Uso |
|------|--------|-----|---------|---------|-----------|-------|-----|
| 10 | Sensores-Fusagasuga | 10.0.224.0/22 | 255.255.252.0 | 10.0.224.1 | 10.0.224.2 - 10.0.227.254 | 1022 | Sensores ambientales |
| 20 | RFID-Fusagasuga | 10.0.228.0/24 | 255.255.255.0 | 10.0.228.1 | 10.0.228.2 - 10.0.228.254 | 253 | Lectores RFID |
| 30 | Camaras-Fusagasuga | 10.0.229.0/24 | 255.255.255.0 | 10.0.229.1 | 10.0.229.2 - 10.0.229.254 | 253 | Cámaras IP |
| 40 | Edge-Fusagasuga | 10.0.230.0/27 | 255.255.255.224 | 10.0.230.1 | 10.0.230.2 - 10.0.230.30 | 29 | Gateways, servidores edge |
| 50 | Gestion-Fusagasuga | 10.0.231.0/28 | 255.255.255.240 | 10.0.231.1 | 10.0.231.2 - 10.0.231.14 | 13 | Equipos de red |
| 60 | Usuarios-Fusagasuga | 10.0.232.0/23 | 255.255.254.0 | 10.0.232.1 | 10.0.232.2 - 10.0.233.254 | 509 | Usuarios oficina |

---

## Direccionamiento de Ejemplo por Dispositivo

### SEDE 1 - TUNJA (Ejemplo detallado)

#### VLAN 10 - Sensores Ambientales (10.0.0.0/22)

| Dispositivo | Tipo | IP Asignada | MAC Address | Ubicación |
|-------------|------|-------------|-------------|-----------|
| sensor-tunja-001 | Temp/Humedad | 10.0.0.10 | 00:1A:2B:3C:4D:01 | Campo A - Parcela 1 |
| sensor-tunja-002 | Temp/Humedad | 10.0.0.11 | 00:1A:2B:3C:4D:02 | Campo A - Parcela 2 |
| sensor-tunja-003 | Presión | 10.0.0.12 | 00:1A:2B:3C:4D:03 | Campo A - Sistema riego |
| sensor-tunja-050 | Temp/Humedad | 10.0.0.60 | 00:1A:2B:3C:4D:50 | Campo B - Parcela 1 |
| ... | ... | ... | ... | ... |

#### VLAN 20 - Lectores RFID (10.0.4.0/24)

| Dispositivo | Tipo | IP Asignada | Ubicación |
|-------------|------|-------------|-----------|
| rfid-tunja-bodega-01 | Lector RFID | 10.0.4.10 | Bodega principal - Entrada |
| rfid-tunja-bodega-02 | Lector RFID | 10.0.4.11 | Bodega principal - Salida |
| rfid-tunja-camion-01 | Lector RFID | 10.0.4.20 | Camión 001 |
| rfid-tunja-camion-02 | Lector RFID | 10.0.4.21 | Camión 002 |

#### VLAN 30 - Cámaras IP (10.0.5.0/24)

| Dispositivo | Tipo | IP Asignada | Ubicación |
|-------------|------|-------------|-----------|
| cam-tunja-001 | Cámara IP 4MP | 10.0.5.10 | Campo A - Vista general |
| cam-tunja-002 | Cámara IP 4MP | 10.0.5.11 | Bodega - Entrada |
| cam-tunja-003 | Cámara PTZ | 10.0.5.12 | Perímetro - Puerta principal |

#### VLAN 40 - Servidores Edge (10.0.6.0/27)

| Dispositivo | Tipo | IP Asignada | Especificaciones |
|-------------|------|-------------|------------------|
| gateway-tunja-lora-01 | Gateway LoRa | 10.0.6.10 | Concentrador sensores campo |
| gateway-tunja-lora-02 | Gateway LoRa | 10.0.6.11 | Redundancia |
| edge-server-tunja-01 | Servidor Edge | 10.0.6.20 | Intel NUC i7, 32GB RAM |
| mqtt-broker-tunja | MQTT Local | 10.0.6.21 | Mosquitto broker local |

#### VLAN 50 - Gestión de Red (10.0.7.0/28)

| Dispositivo | Tipo | IP Asignada | Modelo |
|-------------|------|-------------|--------|
| switch-core-tunja | Switch L3 | 10.0.7.2 | Cisco Catalyst 2960 |
| switch-campo-tunja | Switch L2 | 10.0.7.3 | TP-Link Managed |
| router-tunja | Router VPN | 10.0.7.4 | Ubiquiti EdgeRouter |
| ap-controller-tunja | WiFi Controller | 10.0.7.5 | Unifi Controller |

---

## Resumen de Capacidad Total

| Sede | Red Principal | Sensores | RFID | Cámaras | Edge | Usuarios |
|------|---------------|----------|------|---------|------|----------|
| Tunja | 10.0.0.0/19 | 1022 | 253 | 253 | 29 | 509 |
| Duitama | 10.0.32.0/19 | 1022 | 253 | 253 | 29 | 509 |
| Sogamoso | 10.0.64.0/19 | 1022 | 253 | 253 | 29 | 509 |
| Chiquinquirá | 10.0.96.0/19 | 1022 | 253 | 253 | 29 | 509 |
| Bogotá | 10.0.128.0/19 | 1022 | 253 | 253 | 29 | 1022 |
| Zipaquirá | 10.0.160.0/19 | 1022 | 253 | 253 | 29 | 509 |
| Facatativá | 10.0.192.0/19 | 1022 | 253 | 253 | 29 | 509 |
| Fusagasugá | 10.0.224.0/19 | 1022 | 253 | 253 | 29 | 509 |
| **TOTAL** | 10.0.0.0/16 | **8176** | **2024** | **2024** | **232** | **5085** |

---

## Convenciones y Mejores Prácticas

### Asignación de IPs
- **Gateway**: Primera IP utilizable (.1)
- **Servidores críticos**: .2 - .20
- **Dispositivos IoT**: .21 en adelante
- **DHCP Pool**: Últimas 100 IPs de cada segmento

### Nomenclatura de Dispositivos
```
[tipo]-[sede]-[funcion]-[numero]
Ejemplo: sensor-tunja-temp-001
         gateway-bogota-lora-01
         rfid-duitama-bodega-02
```

### Reservas DHCP
- Todos los sensores y dispositivos IoT tienen IP reservada por MAC
- Los usuarios utilizan DHCP dinámico
- Los servidores tienen IP estática configurada

### Routing Entre Sedes
- **Protocolo**: OSPF (Open Shortest Path First)
- **VPN Site-to-Site**: IPsec entre todas las sedes
- **Concentrador VPN**: Sede Bogotá (Central)
- **Backup Link**: LTE/5G en cada sede
