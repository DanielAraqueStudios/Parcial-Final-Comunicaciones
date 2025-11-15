# Sistema IoT para Agricultura Inteligente Agroindustrial

## 📋 Descripción del Proyecto

Solución integral de IoT para empresa agrícola con **8 sedes distribuidas entre Boyacá y Cundinamarca**, implementando monitoreo automatizado de cultivos, trazabilidad de productos mediante RFID, y gestión centralizada en la nube.

### Caso de Negocio

- **Ubicación**: 8 sedes distribuidas (Boyacá y Cundinamarca)
- **Alcance**: Campos de cultivo, bodegas, flota de camiones
- **Objetivo**: Sistematización y automatización con redes modernas e infraestructura IoT

## 🎯 Componentes del Sistema

### Sensores e Instrumentación
- **Sensores Ambientales**: Humedad, temperatura, presión
- **Sistema RFID**: Etiquetado de bajo costo para trazabilidad de productos
- **Cámaras IP**: Monitoreo visual de cultivos y seguridad
- **Actuadores**: Sistema de riego automatizado

### Conectividad
- **Redes Inalámbricas**: WiFi, LoRa, LTE/5G
- **Protocolos**: MQTT, TCP/IP, WebSocket, TLS/HTTPS
- **Edge Computing**: Procesamiento local en gateways

### Plataforma Cloud
- **AWS IoT Core**: Gestión de dispositivos y mensajería
- **Almacenamiento**: PostgreSQL (trazabilidad) + DynamoDB (telemetría)
- **Procesamiento**: Lambda functions para análisis en tiempo real

## 📂 Estructura del Proyecto

```
├── architecture/                # Documentación de arquitectura
│   ├── network-design/         # Diseño de red IP y subnetting
│   ├── protocols/              # Especificaciones de protocolos
│   ├── diagrams/               # Diagramas de arquitectura (manuales)
│   └── security/               # Estrategia de seguridad
├── backend/                    # Backend Python (FastAPI)
│   ├── app/
│   │   ├── api/               # Endpoints REST
│   │   ├── mqtt/              # Cliente MQTT y handlers
│   │   ├── models/            # Modelos de datos
│   │   ├── services/          # Lógica de negocio
│   │   └── database/          # Configuración DB
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Páginas principales
│   │   ├── services/          # Servicios API/WebSocket
│   │   └── utils/             # Utilidades
│   ├── package.json
│   └── Dockerfile
├── database/                   # Esquemas y migraciones
│   ├── postgresql/
│   │   ├── schema.sql
│   │   └── migrations/
│   └── dynamodb/
│       └── tables.json
├── mqtt-broker/               # Configuración Mosquitto
│   ├── config/
│   │   ├── mosquitto.conf
│   │   └── acl.conf
│   └── certs/                 # Certificados TLS
├── edge-computing/            # Servicios edge (gateways)
│   ├── lora-gateway/
│   ├── processing-rules/      # Reglas de riego
│   └── offline-sync/
├── aws-infrastructure/        # IaC para AWS
│   ├── cloudformation/
│   │   ├── iot-core.yaml
│   │   ├── network.yaml
│   │   ├── compute.yaml
│   │   └── storage.yaml
│   ├── terraform/             # Alternativa Terraform
│   └── scripts/               # Scripts de despliegue
├── security/                  # Configuración de seguridad
│   ├── certificates/          # Gestión de certificados X.509
│   ├── vpn/                   # Configuración VPN
│   └── firewall-rules/        # Reglas de firewall
├── monitoring/                # Monitoreo y logging
│   ├── prometheus/
│   ├── grafana/
│   └── cloudwatch/
├── docker-compose.yml         # Orquestación local
└── .env.example              # Variables de entorno
```

## 🏗️ Arquitectura del Sistema

### 1. Arquitectura de Red IP

#### Plan de Direccionamiento (8 Sedes)

**Red Principal**: `10.0.0.0/16` (Rango privado Clase A)

| Sede | Ubicación | Red Principal | Rango |
|------|-----------|---------------|-------|
| Sede 1 | Tunja | 10.0.0.0/19 | 10.0.0.1 - 10.0.31.254 |
| Sede 2 | Duitama | 10.0.32.0/19 | 10.0.32.1 - 10.0.63.254 |
| Sede 3 | Sogamoso | 10.0.64.0/19 | 10.0.64.1 - 10.0.95.254 |
| Sede 4 | Chiquinquirá | 10.0.96.0/19 | 10.0.96.1 - 10.0.127.254 |
| Sede 5 | Bogotá | 10.0.128.0/19 | 10.0.128.1 - 10.0.159.254 |
| Sede 6 | Zipaquirá | 10.0.160.0/19 | 10.0.160.1 - 10.0.191.254 |
| Sede 7 | Facatativá | 10.0.192.0/19 | 10.0.192.1 - 10.0.223.254 |
| Sede 8 | Fusagasugá | 10.0.224.0/19 | 10.0.224.1 - 10.0.255.254 |

#### Segmentación por VLANs (Ejemplo Sede 1)

| VLAN ID | Función | Red | Gateway | Dispositivos |
|---------|---------|-----|---------|--------------|
| VLAN 10 | Sensores Ambientales | 10.0.0.0/22 | 10.0.0.1 | Humedad, temp, presión |
| VLAN 20 | Lectores RFID | 10.0.4.0/24 | 10.0.4.1 | Bodegas, camiones |
| VLAN 30 | Cámaras IP | 10.0.5.0/24 | 10.0.5.1 | Vigilancia cultivos |
| VLAN 40 | Servidores Edge | 10.0.6.0/27 | 10.0.6.1 | Gateways, procesamiento |
| VLAN 50 | Gestión | 10.0.7.0/28 | 10.0.7.1 | Switches, routers |
| VLAN 60 | Usuarios | 10.0.8.0/23 | 10.0.8.1 | Oficina, tablets |

### 2. Protocolos y Tecnologías

#### Nivel de Campo (Sensores → Gateways)

- **LoRa/LoRaWAN**: Sensores remotos en campos extensos
  - Frecuencia: 915 MHz (banda ISM Colombia)
  - Alcance: hasta 15 km en campo abierto
  - Data rate: 0.3 - 50 kbps
  
- **WiFi 802.11ac**: Sensores en bodegas y áreas con infraestructura
  - Frecuencia: 2.4/5 GHz
  - Seguridad: WPA3-Enterprise
  
- **Zigbee**: Red mesh para sensores de alta densidad
  - Protocolo: IEEE 802.15.4
  - Topología: Mesh auto-sanadora

#### Nivel de Agregación (Gateways → Servidores Edge)

- **MQTT**: Protocolo principal para telemetría
  - Broker: Eclipse Mosquitto
  - QoS: Nivel 1 (al menos una vez)
  - Keep-alive: 60 segundos
  
- **TCP/IP**: Comunicación directa para datos críticos
- **WebSocket**: Streaming en tiempo real hacia dashboards

#### Nivel de Nube (Edge → Cloud)

- **TLS 1.3**: Cifrado de transporte
- **HTTPS/REST**: APIs seguras
- **AWS IoT Core**: Protocolo MQTT sobre TLS
- **VPN IPsec**: Túneles seguros entre sedes y cloud

### 3. Infraestructura de Servidores

#### Edge Computing (Por Sede)

**Gateway Principal** (Raspberry Pi 4 / Industrial PC)
- CPU: ARM Cortex-A72 o Intel Atom
- RAM: 4-8 GB
- Storage: 128 GB SSD
- Funciones:
  - Agregación de datos de sensores
  - Procesamiento local de reglas de riego
  - Cache de datos para operación offline
  - Bridge LoRa/WiFi → MQTT

**Servidor Edge Local** (Mini PC / NUC)
- CPU: Intel i5/i7 o AMD Ryzen
- RAM: 16-32 GB
- Storage: 512 GB SSD + 2 TB HDD
- Funciones:
  - Base de datos local (PostgreSQL)
  - Procesamiento de inferencia ML
  - Almacenamiento temporal (buffer)
  - Sincronización con nube

#### Cloud Infrastructure (AWS)

**Compute**
- **AWS IoT Core**: Gestión de 10,000+ dispositivos
- **Lambda Functions**: Procesamiento serverless
- **EC2 Instances**: 
  - t3.medium (backend API)
  - t3.small (MQTT broker redundante)

**Storage**
- **RDS PostgreSQL**: 
  - Instancia: db.t3.large
  - Storage: 500 GB SSD (escalable)
  - Multi-AZ para alta disponibilidad
  
- **DynamoDB**: 
  - Telemetría en tiempo real
  - Provisioned: 100 WCU / 200 RCU
  - Auto-scaling habilitado
  
- **S3**:
  - Archivos raw de sensores
  - Logs históricos
  - Respaldos de base de datos
  - Lifecycle: Glacier después de 90 días

**Networking**
- **VPC**: Red privada virtual
- **VPN Gateway**: Conexión segura con sedes
- **CloudFront**: CDN para frontend
- **Route 53**: DNS y routing

### 4. Gestión de Datos

#### Streaming en Tiempo Real

**AWS Kinesis Data Streams**
- Ingesta: 1,000 msgs/segundo
- Retention: 24 horas
- Consumers: Lambda, analytics

**Processing Pipeline**
```
Sensores → MQTT → IoT Core → Kinesis → Lambda → DynamoDB
                                   ↓
                              CloudWatch Alarms
```

#### Almacenamiento SQL (Trazabilidad)

**PostgreSQL Schema**
- `sedes`: Información de cada sede
- `campos`: Registros de campos de cultivo
- `productos`: Catálogo de productos agrícolas
- `etiquetas_rfid`: Registro de tags y asociaciones
- `trazabilidad`: Historial completo producto
- `eventos_riego`: Log de acciones de riego
- `usuarios`: Gestión de acceso

**Optimizaciones**
- Índices en timestamp, sede_id, rfid_tag
- Particionamiento por fecha (mensual)
- Materialized views para dashboards

#### Almacenamiento NoSQL (Telemetría)

**DynamoDB Tables**
- `sensor_readings`: Lecturas brutas
  - PK: sensor_id
  - SK: timestamp
  - TTL: 30 días
  
- `sensor_aggregates`: Datos agregados
  - Promedios horarios/diarios
  - Estadísticas por campo

### 5. Estrategia de Seguridad

#### Seguridad en Tránsito

**Certificados Digitales X.509**
- CA privada con AWS Certificate Manager
- Certificados por dispositivo (rotación anual)
- CRL (Certificate Revocation List)

**Autenticación Mutua (mTLS)**
```
Cliente                      Servidor
  |-- ClientHello ----------->|
  |<-- ServerHello + Cert ----|
  |-- Client Cert ----------->|
  |<-- Verify + Handshake ----|
  |== Encrypted Channel ======|
```

**Protocolos Seguros**
- MQTT sobre TLS (puerto 8883)
- HTTPS para todas las APIs (puerto 443)
- SSH para gestión (puerto 22, key-based)
- VPN IPsec para interconexión

#### Seguridad en Reposo

- **Cifrado de bases de datos**: AES-256
- **S3 Encryption**: Server-side (SSE-S3)
- **Secretos**: AWS Secrets Manager
- **Keys**: AWS KMS (rotation automática)

#### Segmentación de Red

**Firewalls por Capas**

1. **Firewall Perimetral** (por sede)
   - Bloqueo de puertos no utilizados
   - Whitelist de IPs cloud
   - Inspección de paquetes (DPI)

2. **Firewall Inter-VLAN**
   - Regla: VLAN Sensores → solo Gateway
   - Regla: VLAN RFID → solo Servidor Edge
   - Regla: VLAN Gestión → todo (admin)

3. **AWS Security Groups**
   - Ingress: solo desde VPN o CloudFront
   - Egress: específico por servicio
   - Logs en CloudWatch

**Políticas de Acceso**

- **IAM Roles**: Mínimo privilegio
- **MFA**: Obligatorio para administradores
- **Auditoría**: CloudTrail todas las acciones
- **Rotación**: Passwords cada 90 días

#### Respuesta a Incidentes

- **IDS/IPS**: Suricata en gateways
- **SIEM**: Integración con AWS GuardDuty
- **Alertas**: SNS para eventos críticos
- **Backups**: Diarios con retención 30 días

## 🚀 Despliegue

### Requisitos Previos

- Docker y Docker Compose
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Cuenta AWS con permisos IoT/EC2/RDS
- Certificados SSL/TLS

### Instalación Local

```bash

# Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales

# Levantar servicios con Docker Compose
docker-compose up -d

# Inicializar base de datos
docker-compose exec backend python scripts/init_db.py

# Acceder a la aplicación
# Frontend: http://localhost:3000
# API: http://localhost:8000
# MQTT Broker: mqtt://localhost:1883
```

### Despliegue en AWS

```bash
# Configurar AWS CLI
aws configure

# Desplegar infraestructura
cd aws-infrastructure/cloudformation
./deploy.sh

# Registrar dispositivos IoT
python scripts/provision_devices.py --sede all

# Configurar VPN
./setup-vpn.sh
```

## 📊 Monitoreo y Operación

### Dashboards Disponibles

1. **Vista General**: Estado de todas las sedes
2. **Monitoreo de Cultivos**: Sensores en tiempo real
3. **Trazabilidad RFID**: Seguimiento de productos
4. **Alertas de Riego**: Notificaciones automáticas
5. **Salud del Sistema**: Métricas de infraestructura

### Métricas Clave

- Dispositivos conectados/desconectados
- Latencia de mensajes MQTT
- Tasa de errores en sensores
- Uso de ancho de banda por sede
- Almacenamiento utilizado (DB/S3)

## 🔧 Mantenimiento

### Tareas Programadas

- **Diario**: Backup de bases de datos
- **Semanal**: Revisión de logs y alertas
- **Mensual**: Actualización de certificados próximos a vencer
- **Trimestral**: Auditoría de seguridad

### Soporte

- Documentación técnica completa en `/architecture/`
- Diagramas de red en `/architecture/diagrams/`
- Runbooks de operación en `/docs/runbooks/`

## 📄 Licencia

Proyecto académico - Universidad Militar Nueva Granada  
Mecatrónica - Sexto Semestre - Comunicaciones  
Noviembre 2025

## 👥 Autor

Daniel Araque - Parcial Final Comunicaciones
