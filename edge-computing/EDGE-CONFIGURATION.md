# Configuración Edge Computing

## Arquitectura Edge por Sede

```
Sensores → Gateway LoRa → Servidor Edge → MQTT Cloud
                              ↓
                       PostgreSQL Local
                              ↓
                    Reglas de Procesamiento
```

## Hardware Edge Server

### Especificaciones Mínimas
- **CPU**: Intel NUC i5 / Raspberry Pi 4 (8GB)
- **RAM**: 8-16 GB
- **Storage**: 256 GB SSD + 1 TB HDD
- **Red**: Gigabit Ethernet + WiFi
- **IP**: VLAN 40 (ej: 10.0.6.20)

## Servicios en Edge

### 1. PostgreSQL Local (Cache/Buffer)

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres-edge:
    image: postgres:15-alpine
    container_name: postgres-edge-tunja
    volumes:
      - ./data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: iot_edge
      POSTGRES_USER: edge_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    restart: unless-stopped
```

### 2. MQTT Broker Local

```yaml
  mosquitto:
    image: eclipse-mosquitto:2.0
    container_name: mqtt-broker-tunja
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - ./mosquitto/data:/mosquitto/data
      - ./mosquitto/certs:/mosquitto/certs
    ports:
      - "1883:1883"
      - "8883:8883"
    restart: unless-stopped
```

### 3. Edge Processing Engine

```yaml
  edge-processor:
    build: ./edge-processor
    container_name: edge-processor-tunja
    environment:
      SEDE_ID: tunja
      MQTT_BROKER: mqtt://mosquitto:1883
      DB_HOST: postgres-edge
    depends_on:
      - postgres-edge
      - mosquitto
    restart: unless-stopped
```

## Reglas de Riego Automatizado

### Lógica de Decisión (Python)

```python
# edge_processor/irrigation_rules.py

class IrrigationController:
    THRESHOLDS = {
        'humedad_minima': 40,  # %
        'temperatura_maxima': 32,  # °C
        'hora_inicio': 6,  # 6 AM
        'hora_fin': 10,  # 10 AM
    }
    
    def should_irrigate(self, sensor_data):
        """
        Determina si se debe activar el riego
        """
        humedad = sensor_data.get('humedad')
        temperatura = sensor_data.get('temperatura')
        hora_actual = datetime.now().hour
        
        # Regla 1: Humedad baja
        if humedad < self.THRESHOLDS['humedad_minima']:
            return True, "Humedad bajo umbral"
        
        # Regla 2: Temperatura alta + ventana horaria
        if (temperatura > self.THRESHOLDS['temperatura_maxima'] and
            self.THRESHOLDS['hora_inicio'] <= hora_actual <= self.THRESHOLDS['hora_fin']):
            return True, "Temperatura alta en ventana de riego"
        
        return False, "Condiciones normales"
    
    def calculate_duration(self, sensor_data):
        """
        Calcula duración del riego en minutos
        """
        humedad = sensor_data.get('humedad')
        deficit = self.THRESHOLDS['humedad_minima'] - humedad
        
        # 2 minutos por cada punto porcentual de déficit
        duration = max(10, deficit * 2)
        return min(duration, 60)  # Máximo 1 hora
```

### Procesamiento en Tiempo Real

```python
# edge_processor/main.py

import paho.mqtt.client as mqtt
import psycopg2
from irrigation_rules import IrrigationController

controller = IrrigationController()

def on_message(client, userdata, msg):
    """
    Procesa mensajes MQTT de sensores
    """
    topic = msg.topic
    payload = json.loads(msg.payload)
    
    # Ejemplo: agricultura/tunja/sensores/sensor-001/humedad
    if 'sensores' in topic:
        sensor_id = payload['device_id']
        
        # Guardar en DB local
        save_to_local_db(payload)
        
        # Evaluar reglas de riego
        should_irrigate, reason = controller.should_irrigate(payload)
        
        if should_irrigate:
            duration = controller.calculate_duration(payload)
            activate_irrigation(sensor_id, duration, reason)
    
    # Reenviar a cloud (si hay conexión)
    if check_cloud_connection():
        forward_to_cloud(msg)

def activate_irrigation(sensor_id, duration, reason):
    """
    Publica comando MQTT para activar riego
    """
    zona_id = get_zona_from_sensor(sensor_id)
    
    command = {
        'action': 'start',
        'duration_minutes': duration,
        'reason': reason,
        'timestamp': datetime.now().isoformat()
    }
    
    mqtt_client.publish(
        f'agricultura/tunja/riego/{zona_id}/comando',
        json.dumps(command),
        qos=2
    )
    
    log_irrigation_event(zona_id, command)
```

## Sincronización Cloud

### Estrategia de Sync

```python
# edge_processor/sync_manager.py

class CloudSyncManager:
    def __init__(self):
        self.sync_interval = 300  # 5 minutos
        self.pending_queue = []
    
    async def sync_loop(self):
        """
        Sincroniza datos pendientes con cloud
        """
        while True:
            if self.check_cloud_connection():
                await self.sync_pending_data()
            await asyncio.sleep(self.sync_interval)
    
    async def sync_pending_data(self):
        """
        Envía datos almacenados localmente al cloud
        """
        conn = psycopg2.connect(DB_LOCAL)
        cursor = conn.cursor()
        
        # Obtener lecturas no sincronizadas
        cursor.execute("""
            SELECT * FROM sensor_readings 
            WHERE synced = false 
            ORDER BY timestamp 
            LIMIT 1000
        """)
        
        readings = cursor.fetchall()
        
        for reading in readings:
            try:
                # Enviar a AWS IoT Core
                await send_to_iot_core(reading)
                
                # Marcar como sincronizado
                cursor.execute(
                    "UPDATE sensor_readings SET synced = true WHERE reading_id = %s",
                    (reading['reading_id'],)
                )
                conn.commit()
            except Exception as e:
                logger.error(f"Error sync: {e}")
                break
        
        cursor.close()
        conn.close()
```

## Operación Offline

### Cache Local y Buffer

```python
# Cuando no hay conexión cloud
def handle_offline_mode():
    """
    Modo offline: almacenar todo localmente
    """
    # Buffer circular de 7 días
    cleanup_old_data(days=7)
    
    # Continuar procesamiento local
    process_local_rules()
    
    # Alertas críticas por SMS/email local
    send_local_alerts()

def cleanup_old_data(days=7):
    """
    Elimina datos antiguos para liberar espacio
    """
    conn = psycopg2.connect(DB_LOCAL)
    cursor = conn.cursor()
    
    cursor.execute("""
        DELETE FROM sensor_readings 
        WHERE timestamp < NOW() - INTERVAL '%s days' 
        AND synced = true
    """, (days,))
    
    conn.commit()
```

## Monitoreo Edge

### Health Check Script

```bash
#!/bin/bash
# edge_health_check.sh

check_service() {
    if systemctl is-active --quiet $1; then
        echo "✓ $1 running"
    else
        echo "✗ $1 stopped - restarting..."
        systemctl restart $1
    fi
}

check_service docker
check_service mosquitto

# Verificar espacio en disco
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "⚠ Disk usage high: ${DISK_USAGE}%"
    # Limpiar datos antiguos
    docker exec postgres-edge-tunja psql -U edge_user -d iot_edge \
        -c "DELETE FROM sensor_readings WHERE timestamp < NOW() - INTERVAL '3 days'"
fi

# Verificar conexión cloud
if ping -c 1 8.8.8.8 &> /dev/null; then
    echo "✓ Internet OK"
else
    echo "⚠ No internet - offline mode"
fi
```

## Configuración Systemd

```ini
# /etc/systemd/system/edge-processor.service

[Unit]
Description=IoT Edge Processor
After=docker.service
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=/opt/edge-processor
ExecStart=/usr/bin/docker-compose up
ExecStop=/usr/bin/docker-compose down
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Métricas y Logs

```python
# Prometheus metrics
from prometheus_client import Counter, Gauge

messages_processed = Counter('mqtt_messages_processed', 'Total MQTT messages')
irrigation_events = Counter('irrigation_activations', 'Irrigation activations')
sync_queue_size = Gauge('sync_queue_size', 'Pending sync items')
disk_usage = Gauge('disk_usage_percent', 'Disk usage percentage')
```

## Resumen de Capacidades

✅ **Procesamiento Local**: Decisiones sin latencia cloud  
✅ **Reglas de Riego**: Automáticas basadas en sensores  
✅ **Operación Offline**: 7 días de autonomía  
✅ **Sincronización**: Automática cuando hay conexión  
✅ **Failover**: Recuperación automática de servicios
