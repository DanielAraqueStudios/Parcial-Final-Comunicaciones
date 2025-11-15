# API Endpoints - Sensores

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime, timedelta
from app.database.connection import get_db
from app.models.sensor import Sensor
from pydantic import BaseModel

router = APIRouter()

class SensorResponse(BaseModel):
    sensor_id: str
    sede_id: int
    tipo: str
    estado: str
    ultima_lectura: Optional[dict] = None

class SensorStatsResponse(BaseModel):
    sensor_id: str
    periodo: str
    temperatura_avg: float
    temperatura_min: float
    temperatura_max: float
    humedad_avg: float
    num_lecturas: int

@router.get("/", response_model=List[SensorResponse])
async def get_sensors(
    sede_id: Optional[int] = None,
    tipo: Optional[str] = None,
    estado: Optional[str] = Query("activo"),
    db: AsyncSession = Depends(get_db)
):
    """Obtener lista de sensores con filtros"""
    query = "SELECT * FROM sensores WHERE 1=1"
    params = []
    
    if sede_id:
        query += " AND sede_id = $1"
        params.append(sede_id)
    if tipo:
        query += f" AND tipo = ${len(params)+1}"
        params.append(tipo)
    if estado:
        query += f" AND estado = ${len(params)+1}"
        params.append(estado)
    
    result = await db.fetch(query, *params)
    return result

@router.get("/{sensor_id}")
async def get_sensor(sensor_id: str, db: AsyncSession = Depends(get_db)):
    """Obtener detalles de un sensor específico"""
    sensor = await db.fetchrow(
        "SELECT * FROM sensores WHERE sensor_id = $1",
        sensor_id
    )
    
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor no encontrado")
    
    # Obtener última lectura
    ultima_lectura = await db.fetchrow("""
        SELECT temperatura, humedad, presion, timestamp
        FROM sensor_readings
        WHERE sensor_id = $1
        ORDER BY timestamp DESC
        LIMIT 1
    """, sensor_id)
    
    return {
        **dict(sensor),
        "ultima_lectura": dict(ultima_lectura) if ultima_lectura else None
    }

@router.get("/{sensor_id}/stats")
async def get_sensor_stats(
    sensor_id: str,
    periodo: str = Query("24h", regex="^(1h|24h|7d|30d)$"),
    db: AsyncSession = Depends(get_db)
):
    """Obtener estadísticas de un sensor"""
    
    # Calcular intervalo de tiempo
    intervals = {
        "1h": timedelta(hours=1),
        "24h": timedelta(days=1),
        "7d": timedelta(days=7),
        "30d": timedelta(days=30)
    }
    
    start_time = datetime.now() - intervals[periodo]
    
    stats = await db.fetchrow("""
        SELECT 
            sensor_id,
            AVG(temperatura) as temperatura_avg,
            MIN(temperatura) as temperatura_min,
            MAX(temperatura) as temperatura_max,
            AVG(humedad) as humedad_avg,
            COUNT(*) as num_lecturas
        FROM sensor_readings
        WHERE sensor_id = $1 AND timestamp >= $2
        GROUP BY sensor_id
    """, sensor_id, start_time)
    
    if not stats:
        return {"message": "No hay datos en el período solicitado"}
    
    return dict(stats)

@router.get("/{sensor_id}/history")
async def get_sensor_history(
    sensor_id: str,
    start: datetime = Query(None),
    end: datetime = Query(None),
    limit: int = Query(100, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Obtener historial de lecturas"""
    
    query = "SELECT * FROM sensor_readings WHERE sensor_id = $1"
    params = [sensor_id]
    
    if start:
        query += f" AND timestamp >= ${len(params)+1}"
        params.append(start)
    if end:
        query += f" AND timestamp <= ${len(params)+1}"
        params.append(end)
    
    query += f" ORDER BY timestamp DESC LIMIT ${len(params)+1}"
    params.append(limit)
    
    readings = await db.fetch(query, *params)
    return [dict(r) for r in readings]
