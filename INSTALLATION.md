# Sistema IoT Agricultura Inteligente - Guía de Instalación

## 🚀 Despliegue Completo

### Prerequisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo frontend)
- Python 3.11+ (para desarrollo backend)
- PostgreSQL 15+
- Git

### 1. Clonar Repositorio

```bash
git clone https://github.com/DanielAraqueStudios/Parcial-Final-Comunicaciones.git
cd Parcial-Final-Comunicaciones
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Desplegar con Docker Compose

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar estado
docker-compose ps
```

Servicios disponibles:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **MQTT Broker**: localhost:1883 (8883 con TLS)

### 4. Inicializar Base de Datos

```bash
docker-compose exec postgres psql -U admin -d agricultura_iot -f /docker-entrypoint-initdb.d/schema.sql
```

### 5. Verificar Servicios

```bash
# Health check backend
curl http://localhost:8000/health

# Test MQTT
mosquitto_pub -h localhost -p 1883 -t "test" -m "hello"
```

## 🔧 Desarrollo Local

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📊 Configuración de Producción

### AWS Deployment

```bash
cd aws-infrastructure/cloudformation
chmod +x deploy.sh
./deploy.sh
```

### Certificados TLS

```bash
cd security
# Generar CA y certificados
./generate-certs.sh
```

### VPN Site-to-Site

```bash
# Configurar IPsec en cada sede
sudo apt install strongswan
sudo cp security/VPN-CONFIGURATION.md /etc/ipsec.conf
sudo systemctl restart strongswan
```

## 🛠️ Comandos Útiles

### Docker

```bash
# Reconstruir servicios
docker-compose build

# Detener servicios
docker-compose down

# Limpiar volúmenes
docker-compose down -v

# Logs específicos
docker-compose logs backend
docker-compose logs postgres
```

### Base de Datos

```bash
# Backup
docker-compose exec postgres pg_dump -U admin agricultura_iot > backup.sql

# Restore
docker-compose exec -T postgres psql -U admin agricultura_iot < backup.sql

# Acceder a psql
docker-compose exec postgres psql -U admin -d agricultura_iot
```

### MQTT

```bash
# Suscribirse a todos los topics
mosquitto_sub -h localhost -p 1883 -t "agricultura/#" -v

# Publicar mensaje de prueba
mosquitto_pub -h localhost -p 1883 \
  -t "agricultura/tunja/sensores/test/temperatura" \
  -m '{"value":25.5}'

# Con TLS
mosquitto_pub -h localhost -p 8883 \
  --cafile certs/ca.crt \
  --cert certs/client.crt \
  --key certs/client.key \
  -t "test" -m "secure message"
```

## 🔒 Seguridad

### Firewall Rules

```bash
# Permitir puertos necesarios
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8000/tcp  # Backend API
sudo ufw allow 1883/tcp  # MQTT
sudo ufw allow 8883/tcp  # MQTTS
sudo ufw allow 5432/tcp  # PostgreSQL (solo red interna)
```

### Rotación de Certificados

```bash
# Verificar expiración
openssl x509 -in certs/server.crt -noout -dates

# Renovar certificado
cd security
./renew-certificates.sh
```

## 📈 Monitoreo

### Logs

```bash
# Todos los logs
docker-compose logs -f

# Últimas 100 líneas
docker-compose logs --tail=100

# Logs de un servicio específico
docker-compose logs -f backend
```

### Métricas

```bash
# Prometheus metrics (si está configurado)
curl http://localhost:8000/metrics
```

## 🐛 Troubleshooting

### Backend no conecta a MQTT

```bash
# Verificar que Mosquitto esté corriendo
docker-compose ps mosquitto

# Ver logs de Mosquitto
docker-compose logs mosquitto

# Verificar certificados
ls -la certs/
```

### Frontend no carga datos

```bash
# Verificar API backend
curl http://localhost:8000/api/v1/sensors

# Verificar CORS
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://localhost:8000/api/v1/sensors
```

### Base de datos no inicia

```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar volumen
docker volume ls
docker volume inspect parcial-final-comunicaciones_postgres_data

# Recrear volumen
docker-compose down -v
docker-compose up -d postgres
```

## 📚 Documentación Adicional

- **Arquitectura de Red**: `/architecture/network-design/`
- **Protocolos MQTT**: `/architecture/protocols/`
- **Seguridad**: `/security/`
- **Edge Computing**: `/edge-computing/`
- **AWS Infrastructure**: `/aws-infrastructure/`

## 🤝 Soporte

Para problemas o consultas:
- GitHub Issues: https://github.com/DanielAraqueStudios/Parcial-Final-Comunicaciones/issues
- Email: daniel.araque@unimilitar.edu.co
