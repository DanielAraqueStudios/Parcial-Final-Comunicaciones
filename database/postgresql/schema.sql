-- Schema PostgreSQL para Sistema IoT Agroindustrial
-- Optimizado para trazabilidad y telemetría

-- ============================================================
-- 1. CATÁLOGOS Y CONFIGURACIÓN
-- ============================================================

CREATE TABLE sedes (
    sede_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    ubicacion VARCHAR(100),
    departamento VARCHAR(50),
    coordenadas POINT,
    red_principal CIDR NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE campos (
    campo_id SERIAL PRIMARY KEY,
    sede_id INTEGER REFERENCES sedes(sede_id),
    nombre VARCHAR(100) NOT NULL,
    area_hectareas NUMERIC(10,2),
    tipo_cultivo VARCHAR(50),
    coordenadas_poligono POLYGON,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE productos (
    producto_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    codigo_sku VARCHAR(50) UNIQUE,
    descripcion TEXT
);

-- ============================================================
-- 2. DISPOSITIVOS IoT
-- ============================================================

CREATE TABLE sensores (
    sensor_id VARCHAR(50) PRIMARY KEY,
    sede_id INTEGER REFERENCES sedes(sede_id),
    campo_id INTEGER REFERENCES campos(campo_id),
    tipo VARCHAR(30) NOT NULL, -- temperatura, humedad, presion
    ip_address INET,
    mac_address MACADDR,
    ubicacion_descripcion TEXT,
    coordenadas POINT,
    estado VARCHAR(20) DEFAULT 'activo',
    ultimo_heartbeat TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sensores_sede ON sensores(sede_id);
CREATE INDEX idx_sensores_campo ON sensores(campo_id);

CREATE TABLE lectores_rfid (
    lector_id VARCHAR(50) PRIMARY KEY,
    sede_id INTEGER REFERENCES sedes(sede_id),
    tipo_ubicacion VARCHAR(30), -- bodega, camion, entrada, salida
    ip_address INET,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'activo',
    ultimo_heartbeat TIMESTAMP
);

-- ============================================================
-- 3. TELEMETRÍA DE SENSORES (Particionada por fecha)
-- ============================================================

CREATE TABLE sensor_readings (
    reading_id BIGSERIAL,
    sensor_id VARCHAR(50) REFERENCES sensores(sensor_id),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    temperatura NUMERIC(5,2),
    humedad NUMERIC(5,2),
    presion NUMERIC(7,2),
    battery_level SMALLINT,
    signal_strength SMALLINT,
    metadata JSONB
) PARTITION BY RANGE (timestamp);

-- Crear particiones mensuales (ejemplo para 6 meses)
CREATE TABLE sensor_readings_2025_11 PARTITION OF sensor_readings
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE sensor_readings_2025_12 PARTITION OF sensor_readings
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Índices en particiones
CREATE INDEX idx_readings_sensor_ts_2025_11 ON sensor_readings_2025_11(sensor_id, timestamp DESC);
CREATE INDEX idx_readings_ts_2025_11 ON sensor_readings_2025_11(timestamp DESC);

-- ============================================================
-- 4. SISTEMA RFID Y TRAZABILIDAD
-- ============================================================

CREATE TABLE etiquetas_rfid (
    rfid_tag VARCHAR(50) PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(producto_id),
    lote VARCHAR(50),
    fecha_empaque DATE,
    peso_kg NUMERIC(10,2),
    cantidad_unidades INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trazabilidad (
    evento_id BIGSERIAL PRIMARY KEY,
    rfid_tag VARCHAR(50) REFERENCES etiquetas_rfid(rfid_tag),
    lector_id VARCHAR(50) REFERENCES lectores_rfid(lector_id),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    tipo_evento VARCHAR(30), -- lectura, entrada, salida, carga, descarga
    sede_id INTEGER REFERENCES sedes(sede_id),
    ubicacion_detalle TEXT,
    metadata JSONB
);

CREATE INDEX idx_trazabilidad_tag ON trazabilidad(rfid_tag, timestamp DESC);
CREATE INDEX idx_trazabilidad_ts ON trazabilidad(timestamp DESC);
CREATE INDEX idx_trazabilidad_sede ON trazabilidad(sede_id, timestamp DESC);

-- ============================================================
-- 5. SISTEMA DE RIEGO AUTOMATIZADO
-- ============================================================

CREATE TABLE zonas_riego (
    zona_id SERIAL PRIMARY KEY,
    campo_id INTEGER REFERENCES campos(campo_id),
    nombre VARCHAR(50),
    area_hectareas NUMERIC(10,2),
    tipo_riego VARCHAR(30), -- goteo, aspersion, pivot
    estado VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE eventos_riego (
    evento_id BIGSERIAL PRIMARY KEY,
    zona_id INTEGER REFERENCES zonas_riego(zona_id),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    tipo_evento VARCHAR(20), -- inicio, fin, pausa, reanudacion
    duracion_minutos INTEGER,
    volumen_litros NUMERIC(10,2),
    trigger_type VARCHAR(30), -- manual, automatico, sensor
    metadata JSONB
) PARTITION BY RANGE (timestamp);

CREATE TABLE eventos_riego_2025_11 PARTITION OF eventos_riego
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

-- ============================================================
-- 6. ALERTAS Y NOTIFICACIONES
-- ============================================================

CREATE TABLE alertas (
    alerta_id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    tipo VARCHAR(30), -- temperatura_alta, humedad_baja, sensor_offline, etc
    severidad VARCHAR(20), -- info, warning, critical
    sede_id INTEGER REFERENCES sedes(sede_id),
    sensor_id VARCHAR(50) REFERENCES sensores(sensor_id),
    mensaje TEXT,
    valor_actual NUMERIC,
    umbral_configurado NUMERIC,
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, revisada, resuelta
    resuelta_por INTEGER,
    metadata JSONB
);

CREATE INDEX idx_alertas_ts ON alertas(timestamp DESC);
CREATE INDEX idx_alertas_estado ON alertas(estado, timestamp DESC);
CREATE INDEX idx_alertas_severidad ON alertas(severidad, timestamp DESC);

-- ============================================================
-- 7. USUARIOS Y AUDITORÍA
-- ============================================================

CREATE TABLE usuarios (
    usuario_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    rol VARCHAR(30), -- admin, operador, visor
    sede_id INTEGER REFERENCES sedes(sede_id),
    activo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auditoria (
    audit_id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    usuario_id INTEGER REFERENCES usuarios(usuario_id),
    accion VARCHAR(100),
    tabla_afectada VARCHAR(50),
    registro_id VARCHAR(50),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET
) PARTITION BY RANGE (timestamp);

-- ============================================================
-- 8. VISTAS MATERIALIZADAS (para dashboards)
-- ============================================================

-- Estadísticas horarias por sensor
CREATE MATERIALIZED VIEW sensor_stats_hourly AS
SELECT 
    sensor_id,
    date_trunc('hour', timestamp) as hora,
    AVG(temperatura) as temp_promedio,
    MAX(temperatura) as temp_maxima,
    MIN(temperatura) as temp_minima,
    AVG(humedad) as humedad_promedio,
    COUNT(*) as num_lecturas
FROM sensor_readings
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY sensor_id, date_trunc('hour', timestamp);

CREATE UNIQUE INDEX idx_sensor_stats_hourly ON sensor_stats_hourly(sensor_id, hora);

-- Refresh automático cada hora
CREATE OR REPLACE FUNCTION refresh_sensor_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY sensor_stats_hourly;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 9. FUNCIONES ÚTILES
-- ============================================================

-- Función para obtener última lectura de un sensor
CREATE OR REPLACE FUNCTION get_latest_reading(p_sensor_id VARCHAR)
RETURNS TABLE (
    temperatura NUMERIC,
    humedad NUMERIC,
    timestamp TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT sr.temperatura, sr.humedad, sr.timestamp
    FROM sensor_readings sr
    WHERE sr.sensor_id = p_sensor_id
    ORDER BY sr.timestamp DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Función para generar alertas automáticas
CREATE OR REPLACE FUNCTION check_and_create_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Alerta por temperatura alta (>35°C)
    IF NEW.temperatura > 35 THEN
        INSERT INTO alertas (tipo, severidad, sede_id, sensor_id, mensaje, valor_actual, umbral_configurado)
        SELECT 'temperatura_alta', 'warning', s.sede_id, NEW.sensor_id, 
               'Temperatura elevada detectada', NEW.temperatura, 35
        FROM sensores s WHERE s.sensor_id = NEW.sensor_id;
    END IF;
    
    -- Alerta por humedad baja (<30%)
    IF NEW.humedad < 30 THEN
        INSERT INTO alertas (tipo, severidad, sede_id, sensor_id, mensaje, valor_actual, umbral_configurado)
        SELECT 'humedad_baja', 'warning', s.sede_id, NEW.sensor_id,
               'Humedad baja detectada', NEW.humedad, 30
        FROM sensores s WHERE s.sensor_id = NEW.sensor_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sensor_alert_trigger
    AFTER INSERT ON sensor_readings
    FOR EACH ROW
    EXECUTE FUNCTION check_and_create_alert();

-- ============================================================
-- 10. DATOS DE EJEMPLO
-- ============================================================

INSERT INTO sedes (nombre, ubicacion, departamento, red_principal) VALUES
('Tunja', 'Km 5 Vía Paipa', 'Boyacá', '10.0.0.0/19'),
('Duitama', 'Sector El Carmen', 'Boyacá', '10.0.32.0/19'),
('Sogamoso', 'Vereda Pantanitos', 'Boyacá', '10.0.64.0/19'),
('Chiquinquirá', 'Sector Rural Norte', 'Boyacá', '10.0.96.0/19'),
('Bogotá', 'Calle 100 #15-20', 'Cundinamarca', '10.0.128.0/19'),
('Zipaquirá', 'Vereda Portachuelo', 'Cundinamarca', '10.0.160.0/19'),
('Facatativá', 'Sector Manablanca', 'Cundinamarca', '10.0.192.0/19'),
('Fusagasugá', 'Vereda El Resguardo', 'Cundinamarca', '10.0.224.0/19');

INSERT INTO productos (nombre, tipo, codigo_sku) VALUES
('Tomate', 'Hortaliza', 'TOM-001'),
('Papa', 'Tubérculo', 'PAP-001'),
('Cebolla', 'Hortaliza', 'CEB-001'),
('Zanahoria', 'Hortaliza', 'ZAN-001');

-- ============================================================
-- 11. ÍNDICES ADICIONALES PARA RENDIMIENTO
-- ============================================================

CREATE INDEX idx_sensor_readings_metadata ON sensor_readings USING GIN (metadata);
CREATE INDEX idx_trazabilidad_metadata ON trazabilidad USING GIN (metadata);
CREATE INDEX idx_alertas_sede_ts ON alertas(sede_id, timestamp DESC);

-- ============================================================
-- 12. POLÍTICA DE RETENCIÓN (con pg_cron)
-- ============================================================

-- Eliminar datos de sensores mayores a 90 días
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('cleanup-old-readings', '0 2 * * *', 
--   'DELETE FROM sensor_readings WHERE timestamp < NOW() - INTERVAL ''90 days''');
