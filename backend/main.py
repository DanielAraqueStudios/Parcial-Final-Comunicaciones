# Backend API - FastAPI con MQTT

from fastapi import FastAPI, WebSocket, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from app.mqtt.client import MQTTClient
from app.database.connection import get_db
from app.api import sensors, rfid, irrigation, alerts

# MQTT Client global
mqtt_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación"""
    global mqtt_client
    
    # Startup
    mqtt_client = MQTTClient()
    await mqtt_client.connect()
    print("✓ MQTT Client conectado")
    
    yield
    
    # Shutdown
    await mqtt_client.disconnect()
    print("✓ MQTT Client desconectado")

# Inicializar FastAPI
app = FastAPI(
    title="Agricultura IoT API",
    description="API REST para sistema IoT agroindustrial",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(sensors.router, prefix="/api/v1/sensors", tags=["Sensores"])
app.include_router(rfid.router, prefix="/api/v1/rfid", tags=["RFID"])
app.include_router(irrigation.router, prefix="/api/v1/irrigation", tags=["Riego"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alertas"])

@app.get("/")
async def root():
    return {
        "service": "Agricultura IoT API",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "mqtt": mqtt_client.is_connected() if mqtt_client else False,
        "database": "connected"
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    """WebSocket para streaming de telemetría en tiempo real"""
    await websocket.accept()
    
    try:
        while True:
            # Enviar datos de telemetría cada segundo
            data = await get_latest_telemetry()
            await websocket.send_json(data)
            await asyncio.sleep(1)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

async def get_latest_telemetry():
    """Obtener última telemetría de todos los sensores"""
    # Implementación simplificada
    return {
        "timestamp": "2025-11-15T10:30:00Z",
        "sensors_active": 150,
        "alerts_pending": 3
    }
