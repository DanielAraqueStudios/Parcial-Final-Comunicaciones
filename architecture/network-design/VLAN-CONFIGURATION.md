# Configuración de VLANs - Sistema IoT Agroindustrial

## Arquitectura de VLANs por Función

### Diseño Multi-VLAN para Seguridad y Rendimiento

El sistema implementa **segmentación por VLANs** para:
- **Seguridad**: Aislamiento entre segmentos críticos
- **Rendimiento**: Reducción de broadcast domains
- **QoS**: Priorización de tráfico por tipo
- **Gestión**: Simplificación de políticas de firewall

---

## VLANs Estándar en Todas las Sedes

### VLAN 10 - Sensores Ambientales IoT

**Propósito**: Red dedicada para sensores de campo (temperatura, humedad, presión)

| Parámetro | Valor |
|-----------|-------|
| VLAN ID | 10 |
| Nombre | Sensores-[Sede] |
| Tamaño | /22 (1022 hosts) |
| Protocolo | LoRa, WiFi, Zigbee |
| QoS Priority | Clase 3 (Medium) |
| Seguridad | WPA3, 802.1X |

**Características**:
- Tráfico principalmente MQTT (publish)
- Bajo bandwidth (~100 Kbps por sensor)
- Alta cantidad de dispositivos
- Comunicación unidireccional (sensor → gateway)

**Reglas de Firewall**:
```
PERMIT: VLAN 10 → VLAN 40 (Edge Servers) puerto 1883 (MQTT)
PERMIT: VLAN 10 → VLAN 40 (Edge Servers) puerto 8883 (MQTTS)
DENY: VLAN 10 → VLAN 20 (RFID)
DENY: VLAN 10 → VLAN 60 (Usuarios)
DENY: VLAN 10 → Internet directo
```

**Configuración Switch (Ejemplo Cisco)**:
```
vlan 10
 name Sensores-Tunja
 exit

interface range GigabitEthernet1/0/1-24
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
 spanning-tree bpduguard enable
 exit
```

---

### VLAN 20 - Lectores RFID

**Propósito**: Red para sistema de trazabilidad con etiquetas RFID

| Parámetro | Valor |
|-----------|-------|
| VLAN ID | 20 |
| Nombre | RFID-[Sede] |
| Tamaño | /24 (253 hosts) |
| Protocolo | Ethernet, WiFi |
| QoS Priority | Clase 4 (High) |
| Seguridad | 802.1X, MAC filtering |

**Características**:
- Tráfico de lectores RFID fijos y móviles
- Comunicación con base de datos en tiempo real
- Requiere baja latencia (<50ms)
- Escritura y lectura de tags

**Reglas de Firewall**:
```
PERMIT: VLAN 20 → VLAN 40 (Edge Servers) puerto 5432 (PostgreSQL)
PERMIT: VLAN 20 → VLAN 45 (Servidores Central) puerto 443 (HTTPS API)
DENY: VLAN 20 → VLAN 10 (Sensores)
DENY: VLAN 20 → VLAN 30 (Cámaras)
PERMIT: VLAN 20 → Internet puerto 443 (actualizaciones firmware)
```

**Configuración Switch**:
```
vlan 20
 name RFID-Tunja
 exit

interface range GigabitEthernet1/0/25-36
 switchport mode access
 switchport access vlan 20
 switchport port-security
 switchport port-security maximum 2
 switchport port-security mac-address sticky
 exit
```

---

### VLAN 30 - Cámaras IP Vigilancia

**Propósito**: Red dedicada para videovigilancia de cultivos y seguridad

| Parámetro | Valor |
|-----------|-------|
| VLAN ID | 30 |
| Nombre | Camaras-[Sede] |
| Tamaño | /24 (253 hosts) |
| Protocolo | Ethernet, PoE |
| QoS Priority | Clase 2 (Low - pero garantizado) |
| Seguridad | VLAN aislada, HTTPS |

**Características**:
- Alto consumo de bandwidth (2-8 Mbps por cámara 4MP)
- Streaming continuo H.264/H.265
- Power over Ethernet (PoE+)
- Grabación en NVR local y cloud

**Reglas de Firewall**:
```
PERMIT: VLAN 30 → VLAN 40 (Edge Servers) puerto 554 (RTSP)
PERMIT: VLAN 30 → VLAN 40 (Edge Servers) puerto 80,443 (HTTP/HTTPS)
PERMIT: VLAN 30 → VLAN 60 (Usuarios) puerto 443 (visualización)
DENY: VLAN 30 → VLAN 10 (Sensores)
DENY: VLAN 30 → VLAN 20 (RFID)
PERMIT: VLAN 30 → Internet puerto 443 (respaldo cloud)
```

**Configuración Switch con PoE**:
```
vlan 30
 name Camaras-Tunja
 exit

interface range GigabitEthernet1/0/37-48
 switchport mode access
 switchport access vlan 30
 power inline auto
 spanning-tree portfast
 storm-control broadcast level 10.00
 exit
```

---

### VLAN 40 - Servidores Edge / Gateways

**Propósito**: Infraestructura de procesamiento local en cada sede

| Parámetro | Valor |
|-----------|-------|
| VLAN ID | 40 |
| Nombre | Edge-[Sede] |
| Tamaño | /27 (29 hosts) |
| Protocolo | Ethernet Gigabit |
| QoS Priority | Clase 5 (Critical) |
| Seguridad | IP fija, firewall restrictivo |

**Dispositivos**:
- Gateways LoRa/LoRaWAN
- Servidores edge computing
- MQTT brokers locales
- Bases de datos edge (PostgreSQL)
- Sistemas de almacenamiento NAS

**Reglas de Firewall**:
```
PERMIT: VLAN 40 → ALL VLANs (servidor central)
PERMIT: VLAN 40 → Internet puerto 443,8883 (HTTPS, MQTTS a cloud)
PERMIT: VLAN 40 → Internet puerto 5432 (PostgreSQL a RDS AWS)
PERMIT: VLAN 10,20,30 → VLAN 40 (clientes hacia servidores)
PERMIT: VLAN 50 → VLAN 40 (gestión administrativa)
```

**Configuración Switch**:
```
vlan 40
 name Edge-Tunja
 exit

interface range GigabitEthernet2/0/1-8
 switchport mode access
 switchport access vlan 40
 speed 1000
 duplex full
 no cdp enable
 exit
```

---

### VLAN 45 - Servidores Centrales (Solo Bogotá)

**Propósito**: Datacenter central en sede principal

| Parámetro | Valor |
|-----------|-------|
| VLAN ID | 45 |
| Nombre | Servidores-Central |
| Tamaño | /25 (125 hosts) |
| Protocolo | Ethernet 10 Gigabit |
| QoS Priority | Clase 5 (Critical) |
| Seguridad | DMZ, firewall multicapa |

**Dispositivos**:
- Servidores de aplicaciones
- Cluster PostgreSQL (master)
- Servidores de respaldo
- Sistemas de archivos SAN/NAS
- Servidores de autenticación (RADIUS, LDAP)

**Reglas de Firewall**:
```
PERMIT: Todas las sedes → VLAN 45 puertos específicos
PERMIT: VLAN 45 → Internet puertos 443,80 (APIs externas)
PERMIT: VLAN 45 ↔ AWS VPC (VPN túnel)
DENY: VLAN 45 ← Internet (excepto VPN)
```

---

### VLAN 50 - Gestión de Red

**Propósito**: Administración de equipos de infraestructura

| Parámetro | Valor |
|-----------|-------|
| VLAN ID | 50 |
| Nombre | Gestion-[Sede] |
| Tamaño | /28 (13 hosts) |
| Protocolo | Ethernet |
| QoS Priority | Clase 5 (Critical) |
| Seguridad | Acceso SSH con llave, MFA |

**Dispositivos**:
- Switches core y access
- Routers y firewalls
- Access Points controllers
- Sistemas de monitoreo (SNMP)

**Reglas de Firewall**:
```
PERMIT: VLAN 50 → ALL VLANs puertos 22,23,80,443,161 (gestión)
PERMIT: VLAN 60 (admin users) → VLAN 50 puerto 22 (SSH)
DENY: VLAN 10,20,30 → VLAN 50 (sensores no gestionan red)
PERMIT: VLAN 50 → Internet puerto 123 (NTP)
```

**Configuración**:
```
vlan 50
 name Gestion-Tunja
 exit

interface Vlan50
 description Management-VLAN
 ip address 10.0.7.1 255.255.255.240
 no shutdown
 exit

! Permitir SSH solo desde VLAN gestión
line vty 0 4
 access-class 10 in
 transport input ssh
 exit

access-list 10 permit 10.0.7.0 0.0.0.15
```

---

### VLAN 60 - Usuarios Oficina

**Propósito**: Red corporativa para empleados

| Parámetro | Valor |
|-----------|-------|
| VLAN ID | 60 |
| Nombre | Usuarios-[Sede] |
| Tamaño | /23 (509 hosts) o /22 (Bogotá) |
| Protocolo | Ethernet, WiFi |
| QoS Priority | Clase 1 (Best Effort) |
| Seguridad | 802.1X, DHCP snooping |

**Dispositivos**:
- PCs de escritorio
- Laptops
- Tablets y smartphones
- Impresoras de red

**Reglas de Firewall**:
```
PERMIT: VLAN 60 → VLAN 40 puerto 443 (APIs aplicación)
PERMIT: VLAN 60 → VLAN 45 puerto 443 (servicios centrales)
PERMIT: VLAN 60 → Internet puertos 80,443 (navegación)
DENY: VLAN 60 → VLAN 10,20,30 (usuarios no acceden IoT directo)
PERMIT: VLAN 60 (admin) → VLAN 50 puerto 22 (gestión autorizada)
```

**Configuración con DHCP y seguridad**:
```
vlan 60
 name Usuarios-Tunja
 exit

interface Vlan60
 ip address 10.0.8.1 255.255.254.0
 ip helper-address 10.0.6.20
 no shutdown
 exit

! DHCP Snooping para prevenir rogue DHCP servers
ip dhcp snooping
ip dhcp snooping vlan 60
interface range GigabitEthernet3/0/1-48
 ip dhcp snooping trust
 exit
```

---

### VLAN 70 - DMZ (Solo Bogotá)

**Propósito**: Zona desmilitarizada para servicios públicos

| Parámetro | Valor |
|-----------|-------|
| VLAN ID | 70 |
| Nombre | DMZ-Bogota |
| Tamaño | /27 (29 hosts) |
| Protocolo | Ethernet |
| QoS Priority | Clase 3 (Medium) |
| Seguridad | Firewall dedicado, IPS/IDS |

**Dispositivos**:
- Servidor web público
- API Gateway
- Proxy reverso (Nginx)
- Servidores de correo

**Reglas de Firewall**:
```
PERMIT: Internet → VLAN 70 puertos 80,443 (HTTPS público)
PERMIT: VLAN 70 → VLAN 45 puertos específicos (backend)
DENY: VLAN 70 → VLANs internas (excepto 45 controlado)
PERMIT: VLAN 70 → Internet puertos 80,443,25,587 (servicios)
```

---

## Configuración de Trunk Inter-Switch

### Trunk entre Switches de Acceso y Core

```
interface GigabitEthernet0/1
 description Trunk-to-Core-Switch
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40,50,60
 switchport trunk native vlan 999
 exit
```

### Trunk entre Switches y Router (Inter-VLAN Routing)

```
interface GigabitEthernet0/0
 description Trunk-to-Router
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40,50,60
 exit
```

---

## Inter-VLAN Routing

### Router-on-a-Stick (Sedes pequeñas)

```
interface GigabitEthernet0/0
 no shutdown
 exit

interface GigabitEthernet0/0.10
 description Sensores-Tunja
 encapsulation dot1Q 10
 ip address 10.0.0.1 255.255.252.0
 exit

interface GigabitEthernet0/0.20
 description RFID-Tunja
 encapsulation dot1Q 20
 ip address 10.0.4.1 255.255.255.0
 exit

! Repetir para cada VLAN...
```

### Switch Layer 3 (Sede Bogotá)

```
ip routing

interface Vlan10
 description Sensores-Bogota
 ip address 10.0.128.1 255.255.252.0
 no shutdown
 exit

interface Vlan20
 description RFID-Bogota
 ip address 10.0.132.1 255.255.255.0
 no shutdown
 exit

interface Vlan45
 description Servidores-Central
 ip address 10.0.135.1 255.255.255.128
 no shutdown
 exit

! Habilitar routing entre VLANs con ACLs
ip access-list extended VLAN10-TO-VLAN40
 permit tcp 10.0.128.0 0.0.3.255 10.0.134.0 0.0.0.31 eq 1883
 permit tcp 10.0.128.0 0.0.3.255 10.0.134.0 0.0.0.31 eq 8883
 deny ip any any
 exit

interface Vlan10
 ip access-group VLAN10-TO-VLAN40 out
 exit
```

---

## QoS (Quality of Service) por VLAN

### Priorización de Tráfico

| Clase | CoS | DSCP | VLANs | Tipo de Tráfico | % Bandwidth |
|-------|-----|------|-------|-----------------|-------------|
| Critical | 5 | EF (46) | 40, 50 | Gestión, Edge servers | 30% |
| High | 4 | AF41 (34) | 20 | RFID, datos críticos | 25% |
| Medium | 3 | AF31 (26) | 10, 70 | Sensores IoT, DMZ | 20% |
| Low-Guarantee | 2 | AF21 (18) | 30 | Video vigilancia | 15% |
| Best Effort | 0-1 | BE (0) | 60 | Usuarios, Internet | 10% |

### Configuración QoS en Switch

```
! Habilitar QoS globalmente
mls qos

! Confiar en markings de CoS en VLANs críticas
interface range GigabitEthernet2/0/1-8
 description Edge-Servers
 mls qos trust cos
 priority-queue out
 exit

! Clasificar tráfico MQTT como crítico
class-map match-all MQTT-TRAFFIC
 match protocol tcp
 match access-group name MQTT-ACL
 exit

ip access-list extended MQTT-ACL
 permit tcp any any eq 1883
 permit tcp any any eq 8883
 exit

policy-map QOS-POLICY
 class MQTT-TRAFFIC
  set dscp ef
  police 50000000 conform-action transmit exceed-action drop
 exit

! Aplicar política en interfaces trunk
interface GigabitEthernet0/1
 service-policy input QOS-POLICY
 exit
```

---

## Seguridad Adicional por VLAN

### DHCP Snooping

```
ip dhcp snooping
ip dhcp snooping vlan 10,20,30,60

! Interfaces confiables (donde está el servidor DHCP)
interface GigabitEthernet0/1
 ip dhcp snooping trust
 exit
```

### Dynamic ARP Inspection

```
ip arp inspection vlan 10,20,30,60

interface GigabitEthernet0/1
 ip arp inspection trust
 exit
```

### Port Security

```
interface range GigabitEthernet1/0/1-24
 switchport port-security
 switchport port-security maximum 3
 switchport port-security violation restrict
 switchport port-security mac-address sticky
 exit
```

---

## Monitoreo de VLANs

### SNMP para Gestión

```
snmp-server community AgriculturaSecure RO
snmp-server community AgriculturaAdmin RW
snmp-server host 10.0.135.50 version 2c AgriculturaSecure
snmp-server enable traps vlan-membership
```

### Syslog

```
logging host 10.0.135.51
logging trap informational
logging source-interface Vlan50
```

### NetFlow para Análisis de Tráfico

```
ip flow-export destination 10.0.135.52 9996
ip flow-export version 9

interface Vlan10
 ip flow ingress
 ip flow egress
 exit
```

---

## Documentación para Diagramas Manuales

### Elementos a Incluir en Diagrama Manual

1. **Switches con VLANs**:
   - Dibujar switch core central
   - Indicar VLANs configuradas (10, 20, 30, 40, 50, 60)
   - Mostrar trunk links (802.1Q)

2. **Dispositivos por VLAN**:
   - VLAN 10: Iconos de sensores (temperatura, humedad)
   - VLAN 20: Lectores RFID
   - VLAN 30: Cámaras IP
   - VLAN 40: Servidores edge
   - VLAN 50: Switch, router
   - VLAN 60: PCs y laptops

3. **Inter-VLAN Routing**:
   - Router o Switch L3 conectado a todas las VLANs
   - Flechas indicando rutas permitidas/bloqueadas

4. **Leyenda de Colores**:
   - VLAN 10: Verde (Sensores)
   - VLAN 20: Amarillo (RFID)
   - VLAN 30: Azul (Cámaras)
   - VLAN 40: Rojo (Servidores)
   - VLAN 50: Gris (Gestión)
   - VLAN 60: Naranja (Usuarios)
