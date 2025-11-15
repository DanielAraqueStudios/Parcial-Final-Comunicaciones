# Sistema IoT para Agricultura Inteligente Agroindustrial

[![Arquitectura](https://img.shields.io/badge/Arquitectura-IoT-green)](./architecture/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-blue)](./backend/)
[![Frontend](https://img.shields.io/badge/Frontend-React-blue)](./frontend/)
[![Cloud](https://img.shields.io/badge/Cloud-AWS-orange)](./aws-infrastructure/)
[![Security](https://img.shields.io/badge/Security-TLS%2FVPN-red)](./security/)

## 📋 Descripción del Proyecto

Solución integral de IoT para empresa agrícola con **8 sedes distribuidas entre Boyacá y Cundinamarca**, implementando monitoreo automatizado de cultivos, trazabilidad de productos mediante RFID, y gestión centralizada en la nube.

### Caso de Negocio

- **Ubicación**: 8 sedes distribuidas (Boyacá y Cundinamarca)
- **Alcance**: Campos de cultivo, bodegas, flota de camiones
- **Objetivo**: Sistematización y automatización con redes modernas e infraestructura IoT

### Métricas del Sistema

| Componente | Cantidad | Detalles |
|------------|----------|----------|
| **Sedes IoT** | 8 | Tunja, Duitama, Sogamoso, Chiquinquirá, Bogotá, Zipaquirá, Facatativá, Fusagasugá |
| **Sensores Ambientales** | 8,176 | Temperatura, humedad, presión atmosférica |
| **Lectores RFID** | 2,024 | Trazabilidad de productos agrícolas |
| **Cámaras IP** | 2,024 | Monitoreo visual y seguridad |
| **Gateways Edge** | 232 | Procesamiento local y agregación de datos |
| **Direcciones IP** | 65,536 | Red privada 10.0.0.0/16 |
| **VLANs** | 48 | 6-8 VLANs por sede para segmentación |

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

---

## 📚 Índice de Documentación

### 🏗️ Arquitectura y Diseño

| Documento | Descripción | Enlace |
|-----------|-------------|--------|
| **Plan de Direccionamiento IP** | Diseño completo de red 10.0.0.0/16 con subnetting para 8 sedes | [📄 IP-ADDRESSING-PLAN.md](./architecture/network-design/IP-ADDRESSING-PLAN.md) |
| **Configuración VLANs** | VLANs por función con comandos Cisco IOS, QoS y seguridad | [📄 VLAN-CONFIGURATION.md](./architecture/network-design/VLAN-CONFIGURATION.md) |
| **Guía de Diagramas Manuales** | Plantillas para dibujar arquitectura de red a mano (requisito del parcial) | [📄 MANUAL-DIAGRAM-GUIDE.md](./architecture/diagrams/MANUAL-DIAGRAM-GUIDE.md) |

### 📡 Protocolos y Comunicaciones

| Documento | Descripción | Enlace |
|-----------|-------------|--------|
| **Arquitectura MQTT** | Broker Mosquitto, topics jerárquicos, QoS, bridge a AWS IoT Core | [📄 MQTT-ARCHITECTURE.md](./architecture/protocols/MQTT-ARCHITECTURE.md) |
| **Configuración LoRa** | LoRaWAN 915MHz, ChirpStack, gateways RAK7248, decoders | [📄 LORA-CONFIGURATION.md](./architecture/protocols/LORA-CONFIGURATION.md) |

### 🔒 Seguridad

| Documento | Descripción | Enlace |
|-----------|-------------|--------|
| **Certificados TLS** | Jerarquía CA, generación de certificados X.509, mTLS | [📄 TLS-CERTIFICATES.md](./security/TLS-CERTIFICATES.md) |
| **Configuración VPN** | IPsec site-to-site con StrongSwan, túneles entre 8 sedes y AWS | [📄 VPN-CONFIGURATION.md](./security/VPN-CONFIGURATION.md) |

### 💾 Base de Datos

| Documento | Descripción | Enlace |
|-----------|-------------|--------|
| **Schema PostgreSQL** | 12 tablas con particionamiento temporal, triggers, vistas materializadas | [📄 schema.sql](./database/postgresql/schema.sql) |

### ⚙️ Edge Computing

| Documento | Descripción | Enlace |
|-----------|-------------|--------|
| **Configuración Edge** | Docker Compose stack, reglas de riego, sincronización offline | [📄 EDGE-CONFIGURATION.md](./edge-computing/EDGE-CONFIGURATION.md) |

### ☁️ Infraestructura AWS

| Documento | Descripción | Enlace |
|-----------|-------------|--------|
| **CloudFormation Template** | Infraestructura completa: VPC, IoT Core, RDS, DynamoDB, Lambda, S3 | [📄 iot-infrastructure.yaml](./aws-infrastructure/cloudformation/iot-infrastructure.yaml) |

### 💻 Backend y Frontend

| Componente | Descripción | Enlace |
|------------|-------------|--------|
| **Backend FastAPI** | API REST async, cliente MQTT, endpoints para sensores e irrigación | [📁 backend/](./backend/) |
| **Frontend React** | Dashboard en tiempo real, control de riego, trazabilidad RFID | [📁 frontend/](./frontend/) |
| **Guía de Instalación** | Despliegue completo con Docker Compose, comandos útiles, troubleshooting | [📄 INSTALLATION.md](./INSTALLATION.md) |

---

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

> **💡 Documentación Detallada**: Ver [Plan de Direccionamiento IP](./architecture/network-design/IP-ADDRESSING-PLAN.md) y [Configuración de VLANs](./architecture/network-design/VLAN-CONFIGURATION.md)

### 1. Arquitectura de Red IP

#### Plan de Direccionamiento (8 Sedes)

**Red Principal**: `10.0.0.0/16` (Rango privado Clase A)

| Sede | Ubicación | Red Principal | Rango | Capacidad |
|------|-----------|---------------|-------|-----------|
| Sede 1 | Tunja | 10.0.0.0/19 | 10.0.0.1 - 10.0.31.254 | 8,190 hosts |
| Sede 2 | Duitama | 10.0.32.0/19 | 10.0.32.1 - 10.0.63.254 | 8,190 hosts |
| Sede 3 | Sogamoso | 10.0.64.0/19 | 10.0.64.1 - 10.0.95.254 | 8,190 hosts |
| Sede 4 | Chiquinquirá | 10.0.96.0/19 | 10.0.96.1 - 10.0.127.254 | 8,190 hosts |
| Sede 5 | Bogotá (HQ) | 10.0.128.0/19 | 10.0.128.1 - 10.0.159.254 | 8,190 hosts |
| Sede 6 | Zipaquirá | 10.0.160.0/19 | 10.0.160.1 - 10.0.191.254 | 8,190 hosts |
| Sede 7 | Facatativá | 10.0.192.0/19 | 10.0.192.1 - 10.0.223.254 | 8,190 hosts |
| Sede 8 | Fusagasugá | 10.0.224.0/19 | 10.0.224.1 - 10.0.255.254 | 8,190 hosts |

📄 **Ver detalles completos**: [IP-ADDRESSING-PLAN.md](./architecture/network-design/IP-ADDRESSING-PLAN.md)

#### Segmentación por VLANs (Ejemplo Sede 1 - Tunja)

| VLAN ID | Función | Red | Gateway | Dispositivos |
|---------|---------|-----|---------|--------------|
| VLAN 10 | Sensores Ambientales | 10.0.0.0/22 | 10.0.0.1 | 1,022 sensores (humedad, temp, presión) |
| VLAN 20 | Lectores RFID | 10.0.4.0/24 | 10.0.4.1 | 253 lectores (bodegas, camiones) |
| VLAN 30 | Cámaras IP | 10.0.5.0/24 | 10.0.5.1 | 253 cámaras (vigilancia cultivos) |
| VLAN 40 | Servidores Edge | 10.0.6.0/27 | 10.0.6.1 | 29 servidores (gateways, procesamiento) |
| VLAN 50 | Gestión | 10.0.7.0/28 | 10.0.7.1 | 13 equipos (switches, routers) |
| VLAN 60 | Usuarios | 10.0.8.0/23 | 10.0.8.1 | 509 usuarios (oficina, tablets) |

📄 **Ver configuraciones Cisco IOS**: [VLAN-CONFIGURATION.md](./architecture/network-design/VLAN-CONFIGURATION.md)

📄 **Plantillas para diagramas manuales**: [MANUAL-DIAGRAM-GUIDE.md](./architecture/diagrams/MANUAL-DIAGRAM-GUIDE.md)

### 2. Protocolos y Tecnologías

> **💡 Documentación Detallada**: Ver [MQTT Architecture](./architecture/protocols/MQTT-ARCHITECTURE.md) y [LoRa Configuration](./architecture/protocols/LORA-CONFIGURATION.md)

#### Nivel de Campo (Sensores → Gateways)

- **LoRa/LoRaWAN**: Sensores remotos en campos extensos
  - Frecuencia: 915 MHz (banda ISM Colombia)
  - Alcance: hasta 15 km en campo abierto
  - Data rate: 0.3 - 50 kbps
  - 📄 **Configuración completa**: [LORA-CONFIGURATION.md](./architecture/protocols/LORA-CONFIGURATION.md)
  
- **WiFi 802.11ac**: Sensores en bodegas y áreas con infraestructura
  - Frecuencia: 2.4/5 GHz
  - Seguridad: WPA3-Enterprise
  
- **Zigbee**: Red mesh para sensores de alta densidad
  - Protocolo: IEEE 802.15.4
  - Topología: Mesh auto-sanadora

#### Nivel de Agregación (Gateways → Servidores Edge)

- **MQTT**: Protocolo principal para telemetría
  - Broker: Eclipse Mosquitto
  - QoS: Nivel 0/1/2 según criticidad
  - Keep-alive: 60 segundos
  - Topics: `agricultura/{sede}/sensores/{sensor_id}/{tipo}`
  - 📄 **Arquitectura completa**: [MQTT-ARCHITECTURE.md](./architecture/protocols/MQTT-ARCHITECTURE.md)
  
- **TCP/IP**: Comunicación directa para datos críticos
- **WebSocket**: Streaming en tiempo real hacia dashboards

#### Nivel de Nube (Edge → Cloud)

- **TLS 1.3**: Cifrado de transporte
- **HTTPS/REST**: APIs seguras
- **AWS IoT Core**: Protocolo MQTT sobre TLS
- **VPN IPsec**: Túneles seguros entre sedes y cloud
  - 📄 **Configuración VPN**: [VPN-CONFIGURATION.md](./security/VPN-CONFIGURATION.md)

### 3. Infraestructura de Servidores

> **💡 Documentación Detallada**: Ver [Edge Configuration](./edge-computing/EDGE-CONFIGURATION.md) y [AWS CloudFormation](./aws-infrastructure/cloudformation/iot-infrastructure.yaml)

#### Edge Computing (Por Sede)

**Gateway Principal** (Raspberry Pi 4 / Industrial PC)
- CPU: ARM Cortex-A72 o Intel Atom
- RAM: 4-8 GB
- Storage: 128 GB SSD
- Funciones:
  - Agregación de datos de sensores
  - Procesamiento local de reglas de riego
  - Cache de datos para operación offline (7 días)
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

📄 **Ver configuración Docker Compose**: [EDGE-CONFIGURATION.md](./edge-computing/EDGE-CONFIGURATION.md)

#### Cloud Infrastructure (AWS)

**Compute**
- **AWS IoT Core**: Gestión de 10,000+ dispositivos
- **Lambda Functions**: Procesamiento serverless de eventos
- **EC2 Instances**: 
  - t3.medium (backend API)
  - t3.small (MQTT broker redundante)

**Storage**
- **RDS PostgreSQL**: 
  - Instancia: db.t3.large Multi-AZ
  - Storage: 500 GB SSD (escalable)
  - 📄 **Ver schema**: [schema.sql](./database/postgresql/schema.sql)
  
- **DynamoDB**: 
  - Telemetría en tiempo real
  - Provisioned: 100 WCU / 200 RCU
  - TTL: 30 días para sensor_readings
  
- **S3**:
  - Archivos raw de sensores
  - Logs históricos
  - Respaldos de base de datos
  - Lifecycle: Glacier después de 90 días

**Networking**
- **VPC**: Red privada virtual 10.1.0.0/16
- **VPN Gateway**: Conexión segura con 8 sedes
- **CloudFront**: CDN para frontend
- **Route 53**: DNS y routing

📄 **Ver infraestructura completa**: [iot-infrastructure.yaml](./aws-infrastructure/cloudformation/iot-infrastructure.yaml)

### 4. Gestión de Datos

> **💡 Schema Completo**: Ver [PostgreSQL Schema](./database/postgresql/schema.sql)

#### Streaming en Tiempo Real

**Pipeline de Procesamiento**
```
Sensores (8,176) → LoRa/WiFi → Gateway → MQTT Broker (Mosquitto)
                                              ↓
                                         Edge Server (PostgreSQL local)
                                              ↓
                                         AWS IoT Core
                                              ↓
                                    Lambda ProcessSensorData
                                    ↙                      ↘
                          RDS PostgreSQL              DynamoDB
                        (Trazabilidad)              (Telemetría)
                                    ↘                      ↙
                                      Backend FastAPI
                                              ↓
                                    WebSocket Streaming
                                              ↓
                                    Frontend React Dashboard
```

#### Almacenamiento SQL (Trazabilidad)

**PostgreSQL Schema** - 12 Tablas Principales
- `sedes`: 8 sedes agrícolas
- `campos`: Campos de cultivo por sede
- `productos`: Catálogo de productos agrícolas
- `sensores`: Registro de 8,176 sensores
- `sensor_readings`: Lecturas con particionamiento mensual
- `etiquetas_rfid`: 2,024+ tags activos
- `trazabilidad`: Historial completo de productos
- `eventos_riego`: Log de irrigación automática
- `alertas`: Sistema de notificaciones
- `usuarios`: Control de acceso

**Optimizaciones**
- Índices en timestamp, sede_id, rfid_tag
- Particionamiento por fecha (mensual)
- Materialized views para dashboards
- Triggers para alertas automáticas

📄 **Ver schema completo**: [schema.sql](./database/postgresql/schema.sql)

#### Almacenamiento NoSQL (Telemetría)

**DynamoDB Tables**
- `sensor_readings`: Lecturas brutas
  - PK: sensor_id
  - SK: timestamp
  - TTL: 30 días (auto-eliminación)
  
- `sensor_aggregates`: Datos agregados
  - Promedios horarios/diarios
  - Estadísticas por campo

### 5. Estrategia de Seguridad

> **💡 Documentación Completa**: Ver [TLS Certificates](./security/TLS-CERTIFICATES.md) y [VPN Configuration](./security/VPN-CONFIGURATION.md)

#### Seguridad en Tránsito

**Certificados Digitales X.509**
- Jerarquía CA de 3 niveles (Root → Intermediate → Device)
- Certificados por dispositivo (8,176 sensores + 2,024 RFID + 2,024 cámaras)
- Rotación anual automatizada
- CRL (Certificate Revocation List)
- 📄 **Guía completa**: [TLS-CERTIFICATES.md](./security/TLS-CERTIFICATES.md)

**Autenticación Mutua (mTLS)**
```
Cliente (Sensor)              Servidor (Gateway/AWS)
  |-- ClientHello ----------->|
  |<-- ServerHello + Cert ----|
  |-- Client Cert ----------->|
  |<-- Verify + Handshake ----|
  |== Encrypted Channel ======|
```

**Protocolos Seguros**
- MQTT sobre TLS (puerto 8883)
- HTTPS para todas las APIs (puerto 443)
- SSH para gestión (puerto 22, key-based only)
- VPN IPsec para interconexión sedes
- 📄 **Configuración IPsec**: [VPN-CONFIGURATION.md](./security/VPN-CONFIGURATION.md)

#### Seguridad en Reposo

- **Cifrado de bases de datos**: AES-256
- **S3 Encryption**: Server-side (SSE-S3)
- **Secretos**: AWS Secrets Manager
- **Keys**: AWS KMS (rotation automática 90 días)

#### Segmentación de Red

**Firewalls por Capas**

1. **Firewall Perimetral** (por sede)
   - Bloqueo de puertos no utilizados
   - Whitelist de IPs cloud AWS
   - Inspección profunda de paquetes (DPI)

2. **Firewall Inter-VLAN**
   - VLAN Sensores (10) → solo Gateway VLAN 40
   - VLAN RFID (20) → solo Edge Server VLAN 40
   - VLAN Gestión (50) → acceso completo (admin)
   - 📄 **Ver ACLs**: [VLAN-CONFIGURATION.md](./architecture/network-design/VLAN-CONFIGURATION.md)

3. **AWS Security Groups**
   - Ingress: solo desde VPN o CloudFront
   - Egress: específico por servicio
   - Logs en CloudWatch

**Políticas de Acceso**

- **IAM Roles**: Mínimo privilegio (Least Privilege)
- **MFA**: Obligatorio para administradores
- **Auditoría**: CloudTrail todas las acciones
- **Rotación**: Passwords cada 90 días

#### Respuesta a Incidentes

- **IDS/IPS**: Suricata en gateways edge
- **SIEM**: Integración con AWS GuardDuty
- **Alertas**: SNS para eventos críticos
- **Backups**: Diarios con retención 30 días

## 🚀 Despliegue

> **💡 Guía Completa**: Ver [INSTALLATION.md](./INSTALLATION.md) para instrucciones detalladas de despliegue

### Requisitos Previos

- Docker y Docker Compose
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Cuenta AWS con permisos IoT/EC2/RDS
- Certificados SSL/TLS

### Instalación Local (Quick Start)

```bash
# Clonar repositorio
git clone https://github.com/DanielAraqueStudios/Parcial-Final-Comunicaciones.git
cd Parcial-Final-Comunicaciones

# Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales

# Levantar servicios con Docker Compose
docker-compose up -d

# Inicializar base de datos
docker-compose exec postgres psql -U admin -d agricultura_iot -f /docker-entrypoint-initdb.d/schema.sql

# Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# MQTT Broker: mqtt://localhost:1883 (8883 con TLS)
```

### Servicios Disponibles

| Servicio | Puerto | Descripción | Documentación |
|----------|--------|-------------|---------------|
| **Frontend React** | 3000 | Dashboard en tiempo real | [frontend/](./frontend/) |
| **Backend FastAPI** | 8000 | API REST + WebSocket | [backend/](./backend/) |
| **PostgreSQL** | 5432 | Base de datos principal | [schema.sql](./database/postgresql/schema.sql) |
| **Mosquitto MQTT** | 1883/8883 | Broker de mensajería | [MQTT-ARCHITECTURE.md](./architecture/protocols/MQTT-ARCHITECTURE.md) |
| **Redis** | 6379 | Cache y sesiones | - |

### Despliegue en AWS

```bash
# Configurar AWS CLI
aws configure

# Desplegar infraestructura con CloudFormation
cd aws-infrastructure/cloudformation
chmod +x deploy.sh
./deploy.sh

# Registrar dispositivos IoT
python scripts/provision_devices.py --sede all

# Configurar VPN site-to-site
cd ../../security
./setup-vpn.sh
```

📄 **Guía completa de instalación**: [INSTALLATION.md](./INSTALLATION.md)

📄 **CloudFormation template**: [iot-infrastructure.yaml](./aws-infrastructure/cloudformation/iot-infrastructure.yaml)

## 📊 Monitoreo y Operación

### Dashboards Disponibles

| Dashboard | Descripción | Tecnología |
|-----------|-------------|------------|
| **Vista General** | Estado en tiempo real de 8 sedes, sensores activos, alertas | React + WebSocket |
| **Monitoreo de Cultivos** | Gráficos de temperatura, humedad, presión por sede | Recharts |
| **Mapa de Sedes** | Ubicación geográfica con estado de conectividad | React-Leaflet |
| **Control de Riego** | Gestión de zonas de irrigación, comandos MQTT | FastAPI + MQTT |
| **Trazabilidad RFID** | Seguimiento completo de productos desde campo a bodega | PostgreSQL |
| **Alertas** | Notificaciones automáticas de eventos críticos | Triggers DB + SNS |

### Métricas Clave en Tiempo Real

- ✅ **8,176 Sensores**: Conectados y activos
- 📡 **2,024 Lectores RFID**: Trazabilidad continua
- 📹 **2,024 Cámaras IP**: Monitoreo visual 24/7
- 🌐 **8/8 Sedes**: Online con 98.5% uptime
- 💧 **12 Zonas de Riego**: Automatizadas con reglas de irrigación
- ⚡ **<100ms Latencia**: MQTT entre sensores y cloud

### Arquitectura de Monitoreo

```
Frontend Dashboard (React) ← WebSocket ← Backend FastAPI
                                              ↓
                                    MQTT Client (aiomqtt)
                                              ↓
                                    Mosquitto Broker
                                        ↙        ↘
                              Sensores (8,176)   AWS IoT Core
                                                      ↓
                                                CloudWatch Metrics
```

### Comandos Útiles de Monitoreo

```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# Estado de servicios
docker-compose ps

# Health check de la API
curl http://localhost:8000/health

# Test MQTT (suscribirse a todos los topics)
mosquitto_sub -h localhost -p 1883 -t "agricultura/#" -v

# Ver métricas de PostgreSQL
docker-compose exec postgres psql -U admin -d agricultura_iot -c "
  SELECT sede_nombre, COUNT(*) as sensores_activos 
  FROM sensores 
  WHERE estado = 'activo' 
  GROUP BY sede_nombre;
"
```

📄 **Más comandos**: [INSTALLATION.md](./INSTALLATION.md#-comandos-útiles)

## 🔧 Mantenimiento

### Tareas Programadas

| Frecuencia | Tarea | Automatización |
|------------|-------|----------------|
| **Diario** | Backup de bases de datos PostgreSQL | Cron job + S3 upload |
| **Diario** | Sincronización edge → cloud | Systemd timer |
| **Semanal** | Revisión de logs y alertas | CloudWatch Insights |
| **Mensual** | Actualización de certificados próximos a vencer | Script de rotación automática |
| **Trimestral** | Auditoría de seguridad completa | AWS Security Hub |
| **Anual** | Renovación certificados X.509 | OpenSSL automation |

### Backup y Recuperación

```bash
# Backup manual de PostgreSQL
docker-compose exec postgres pg_dump -U admin agricultura_iot > backup_$(date +%Y%m%d).sql

# Restore desde backup
docker-compose exec -T postgres psql -U admin agricultura_iot < backup_20251115.sql

# Backup automático a S3 (cron diario)
0 2 * * * /scripts/backup-to-s3.sh
```

### Rotación de Certificados

```bash
# Verificar expiración de certificados
cd security
openssl x509 -in certs/server.crt -noout -dates

# Renovar certificados (script automatizado)
./renew-certificates.sh --sede all

# Reiniciar servicios con nuevos certificados
docker-compose restart mosquitto backend
```

### Troubleshooting

📄 **Guía completa de troubleshooting**: [INSTALLATION.md](./INSTALLATION.md#-troubleshooting)

**Problemas comunes:**

1. **Backend no conecta a MQTT**
   ```bash
   docker-compose logs mosquitto
   # Verificar certificados TLS
   ls -la certs/
   ```

2. **Frontend no carga datos**
   ```bash
   # Verificar conectividad con API
   curl http://localhost:8000/api/v1/sensors
   ```

3. **Base de datos no inicia**
   ```bash
   docker-compose logs postgres
   # Recrear volumen si es necesario
   docker-compose down -v && docker-compose up -d
   ```

---

## 📁 Estructura de Archivos del Proyecto

```
Parcial-Final-Comunicaciones/
│
├── 📄 README.md                              ← Documento actual (índice principal)
├── 📄 INSTALLATION.md                        ← Guía completa de instalación
├── 📄 docker-compose.yml                     ← Orquestación de servicios
├── 📄 .env.example                           ← Variables de entorno template
│
├── 📂 architecture/                          # Documentación de arquitectura
│   ├── 📂 network-design/
│   │   ├── 📄 IP-ADDRESSING-PLAN.md         ← Plan de direccionamiento 8 sedes
│   │   └── 📄 VLAN-CONFIGURATION.md         ← Configuración VLANs + Cisco IOS
│   ├── 📂 protocols/
│   │   ├── 📄 MQTT-ARCHITECTURE.md          ← Mosquitto broker + topics
│   │   └── 📄 LORA-CONFIGURATION.md         ← LoRaWAN 915MHz + ChirpStack
│   └── 📂 diagrams/
│       └── 📄 MANUAL-DIAGRAM-GUIDE.md       ← Plantillas para diagramas a mano
│
├── 📂 backend/                               # Backend Python FastAPI
│   ├── 📄 main.py                            ← Aplicación FastAPI principal
│   ├── 📄 requirements.txt                   ← Dependencias Python
│   ├── 📄 Dockerfile                         ← Imagen Docker del backend
│   └── 📂 app/
│       ├── 📂 mqtt/
│       │   └── 📄 client.py                  ← Cliente MQTT async con TLS
│       └── 📂 api/
│           ├── 📄 sensors.py                 ← Endpoints REST sensores
│           └── 📄 irrigation.py              ← Control de riego por MQTT
│
├── 📂 frontend/                              # Frontend React
│   ├── 📄 package.json                       ← Dependencias Node.js
│   ├── 📄 Dockerfile                         ← Imagen Docker con nginx
│   ├── 📄 nginx.conf                         ← Proxy reverso + WebSocket
│   └── 📂 src/
│       ├── 📄 App.tsx                        ← Componente principal React
│       ├── 📂 pages/
│       │   ├── 📄 Dashboard.tsx              ← Dashboard en tiempo real
│       │   └── 📄 Irrigation.tsx             ← Control de riego
│       ├── 📂 components/
│       │   ├── 📄 SensorChart.tsx            ← Gráficos con Recharts
│       │   └── 📄 MapView.tsx                ← Mapa de sedes con Leaflet
│       └── 📂 hooks/
│           └── 📄 useWebSocket.ts            ← Hook WebSocket streaming
│
├── 📂 database/                              # Esquemas de bases de datos
│   └── 📂 postgresql/
│       └── 📄 schema.sql                     ← 12 tablas + triggers + particiones
│
├── 📂 security/                              # Configuración de seguridad
│   ├── 📄 TLS-CERTIFICATES.md                ← Jerarquía CA + generación certs
│   └── 📄 VPN-CONFIGURATION.md               ← IPsec StrongSwan site-to-site
│
├── 📂 edge-computing/                        # Edge computing configuration
│   └── 📄 EDGE-CONFIGURATION.md              ← Docker stack + reglas de riego
│
└── 📂 aws-infrastructure/                    # Infraestructura como código
    └── 📂 cloudformation/
        └── 📄 iot-infrastructure.yaml        ← Template completo AWS (15+ recursos)
```

---

## 🎓 Información Académica

## 🎓 Información Académica

**Universidad**: Universidad Militar Nueva Granada  
**Programa**: Ingeniería en Mecatrónica  
**Asignatura**: Comunicaciones - Sexto Semestre  
**Proyecto**: Parcial Final - Diseño de Sistema IoT Agroindustrial  
**Autor**: Daniel García Araque  
**Fecha**: Noviembre 2025

### Objetivos del Proyecto

1. ✅ Diseñar arquitectura IP completa para 8 sedes con subnetting y VLANs
2. ✅ Establecer protocolos y tecnologías de red (MQTT, LoRa, TLS, VPN)
3. ✅ Definir infraestructura de servidores (edge computing + cloud AWS)
4. ✅ Proponer solución de datos en tiempo real (WebSocket, streaming)
5. ✅ Implementar estrategia de seguridad integral (certificados, mTLS, VPN)
6. ✅ Adjuntar diagramas de arquitectura realizados a mano (templates incluidos)

### Especificaciones Técnicas Implementadas

| Requisito | Implementación | Documento |
|-----------|----------------|-----------|
| **Arquitectura IP** | Red 10.0.0.0/16, 8 sedes con /19, 48 VLANs totales | [IP-ADDRESSING-PLAN.md](./architecture/network-design/IP-ADDRESSING-PLAN.md) |
| **Protocolos IoT** | MQTT/TLS, LoRaWAN 915MHz, WebSocket, HTTPS | [MQTT-ARCHITECTURE.md](./architecture/protocols/MQTT-ARCHITECTURE.md) |
| **Edge Computing** | Gateways con Docker, PostgreSQL local, reglas de riego | [EDGE-CONFIGURATION.md](./edge-computing/EDGE-CONFIGURATION.md) |
| **Cloud** | AWS IoT Core, RDS, DynamoDB, Lambda, S3 | [iot-infrastructure.yaml](./aws-infrastructure/cloudformation/iot-infrastructure.yaml) |
| **Seguridad** | CA X.509, mTLS, VPN IPsec, cifrado AES-256 | [TLS-CERTIFICATES.md](./security/TLS-CERTIFICATES.md) |
| **Base de Datos** | PostgreSQL con 12 tablas, particionamiento, triggers | [schema.sql](./database/postgresql/schema.sql) |
| **Backend** | FastAPI async, cliente MQTT aiomqtt, WebSocket | [backend/](./backend/) |
| **Frontend** | React 18, dashboard en tiempo real, control de riego | [frontend/](./frontend/) |
| **Diagramas Manuales** | Plantillas ASCII y guía de escaneo | [MANUAL-DIAGRAM-GUIDE.md](./architecture/diagrams/MANUAL-DIAGRAM-GUIDE.md) |

### Tecnologías Utilizadas

**Backend**
- Python 3.11
- FastAPI 0.104.1
- aiomqtt 1.2.1
- asyncpg 0.29.0
- PostgreSQL 15

**Frontend**
- React 18
- TypeScript
- Vite
- Recharts (gráficos)
- Leaflet (mapas)
- Socket.IO (WebSocket)

**Infraestructura**
- Docker & Docker Compose
- Mosquitto MQTT Broker
- Redis
- nginx
- AWS CloudFormation

**Seguridad**
- OpenSSL (certificados X.509)
- StrongSwan (VPN IPsec)
- TLS 1.3
- AWS KMS, Secrets Manager

---

## 📞 Contacto y Soporte

**Autor**: Daniel García Araque  
**Email**: est.daniel.garciaa@unimilitar.edu.co  
**GitHub**: [@DanielAraqueStudios](https://github.com/DanielAraqueStudios)  
**Repositorio**: [Parcial-Final-Comunicaciones](https://github.com/DanielAraqueStudios/Parcial-Final-Comunicaciones)

### Recursos Adicionales

- 📄 [Guía de Instalación Completa](./INSTALLATION.md)
- 🏗️ [Arquitectura de Red](./architecture/network-design/)
- 🔒 [Documentación de Seguridad](./security/)
- ☁️ [Templates AWS](./aws-infrastructure/cloudformation/)
- 💾 [Schema de Base de Datos](./database/postgresql/schema.sql)

---

## 📄 Licencia

Proyecto académico desarrollado como parte del Parcial Final de Comunicaciones.  
Universidad Militar Nueva Granada - Noviembre 2025.

**Uso Educativo**: Este proyecto está disponible con fines educativos y de demostración.

---

<div align="center">

**Sistema IoT Agricultura Inteligente** • Noviembre 2025

[![Universidad](https://img.shields.io/badge/Universidad-Militar%20Nueva%20Granada-green)](https://www.umng.edu.co)
[![Programa](https://img.shields.io/badge/Programa-Mecatrónica-blue)](https://www.umng.edu.co)
[![GitHub](https://img.shields.io/badge/GitHub-DanielAraqueStudios-black)](https://github.com/DanielAraqueStudios)

</div>
