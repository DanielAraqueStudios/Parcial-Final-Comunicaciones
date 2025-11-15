# API Endpoints - Sistema de Riego

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime
from pydantic import BaseModel
from app.database.connection import get_db
from app.mqtt.client import MQTTClient

router = APIRouter()

class IrrigationCommand(BaseModel):
    zona_id: int
    action: str  # start, stop, pause
    duration_minutes: int = None
    reason: str = None

class IrrigationEvent(BaseModel):
    evento_id: int
    zona_id: int
    timestamp: datetime
    tipo_evento: str
    duracion_minutos: int
    volumen_litros: float
    trigger_type: str

@router.post("/command")
async def send_irrigation_command(
    command: IrrigationCommand,
    db: AsyncSession = Depends(get_db)
):
    """Enviar comando de riego a una zona"""
    
    # Validar que la zona existe
    zona = await db.fetchrow(
        "SELECT * FROM zonas_riego WHERE zona_id = $1",
        command.zona_id
    )
    
    if not zona:
        raise HTTPException(status_code=404, detail="Zona no encontrada")
    
    # Publicar comando MQTT
    sede = zona['campo_id']  # Obtener sede de la zona
    topic = f"agricultura/sede-{sede}/riego/zona-{command.zona_id}/comando"
    
    payload = {
        "action": command.action,
        "duration_minutes": command.duration_minutes,
        "reason": command.reason or "Manual",
        "timestamp": datetime.now().isoformat()
    }
    
    mqtt_client = MQTTClient()
    await mqtt_client.publish(topic, payload, qos=2)
    
    # Registrar evento
    await db.execute("""
        INSERT INTO eventos_riego 
        (zona_id, tipo_evento, duracion_minutos, trigger_type, metadata)
        VALUES ($1, $2, $3, $4, $5)
    """, command.zona_id, command.action, command.duration_minutes, 
         'manual', {'reason': command.reason})
    
    await db.commit()
    
    return {
        "status": "success",
        "message": f"Comando {command.action} enviado a zona {command.zona_id}",
        "command": payload
    }

@router.get("/zones")
async def get_irrigation_zones(db: AsyncSession = Depends(get_db)):
    """Obtener todas las zonas de riego"""
    zones = await db.fetch("""
        SELECT z.*, c.nombre as campo_nombre, s.nombre as sede_nombre
        FROM zonas_riego z
        JOIN campos c ON z.campo_id = c.campo_id
        JOIN sedes s ON c.sede_id = s.sede_id
        WHERE z.estado = 'activo'
    """)
    return [dict(z) for z in zones]

@router.get("/zones/{zona_id}/events")
async def get_zone_events(
    zona_id: int,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Obtener historial de eventos de una zona"""
    events = await db.fetch("""
        SELECT * FROM eventos_riego
        WHERE zona_id = $1
        ORDER BY timestamp DESC
        LIMIT $2
    """, zona_id, limit)
    
    return [dict(e) for e in events]

@router.get("/status")
async def get_irrigation_status(db: AsyncSession = Depends(get_db)):
    """Obtener estado general del sistema de riego"""
    
    # Zonas activas
    active_zones = await db.fetch("""
        SELECT z.zona_id, z.nombre, e.timestamp as inicio
        FROM zonas_riego z
        JOIN eventos_riego e ON z.zona_id = e.zona_id
        WHERE e.tipo_evento = 'inicio'
        AND NOT EXISTS (
            SELECT 1 FROM eventos_riego e2
            WHERE e2.zona_id = z.zona_id
            AND e2.tipo_evento = 'fin'
            AND e2.timestamp > e.timestamp
        )
    """)
    
    # Estadísticas del día
    today_stats = await db.fetchrow("""
        SELECT 
            COUNT(*) as eventos_hoy,
            SUM(duracion_minutos) as minutos_totales,
            SUM(volumen_litros) as volumen_total
        FROM eventos_riego
        WHERE DATE(timestamp) = CURRENT_DATE
    """)
    
    return {
        "zonas_activas": [dict(z) for z in active_zones],
        "estadisticas_hoy": dict(today_stats) if today_stats else {}
    }
