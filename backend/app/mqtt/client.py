# MQTT Client con aiomqtt

import asyncio
import json
from aiomqtt import Client, MqttError
from typing import Callable, Dict
import ssl
from app.database.connection import get_db_session
from app.models.sensor import SensorReading

class MQTTClient:
    def __init__(self):
        self.client = None
        self.broker = "10.0.6.21"  # MQTT Broker local
        self.port = 8883
        self.topics = [
            "agricultura/+/sensores/+/+",
            "agricultura/+/rfid/+/lectura",
            "agricultura/+/riego/+/estado"
        ]
        self.handlers: Dict[str, Callable] = {}
        
    async def connect(self):
        """Conectar al broker MQTT con TLS"""
        ssl_context = ssl.create_default_context()
        ssl_context.load_cert_chain(
            certfile="/certs/client.crt",
            keyfile="/certs/client.key"
        )
        ssl_context.load_verify_locations(cafile="/certs/ca.crt")
        
        self.client = Client(
            hostname=self.broker,
            port=self.port,
            tls_context=ssl_context,
            client_id="backend-api-01"
        )
        
        await self.client.__aenter__()
        
        # Suscribirse a topics
        for topic in self.topics:
            await self.client.subscribe(topic)
        
        # Iniciar listener
        asyncio.create_task(self._message_loop())
    
    async def disconnect(self):
        """Desconectar del broker"""
        if self.client:
            await self.client.__aexit__(None, None, None)
    
    def is_connected(self):
        """Verificar si está conectado"""
        return self.client is not None
    
    async def _message_loop(self):
        """Loop para recibir mensajes MQTT"""
        try:
            async for message in self.client.messages:
                await self._handle_message(message)
        except MqttError as e:
            print(f"MQTT Error: {e}")
    
    async def _handle_message(self, message):
        """Procesar mensaje MQTT recibido"""
        topic = message.topic.value
        payload = json.loads(message.payload.decode())
        
        print(f"📨 Topic: {topic} | Payload: {payload}")
        
        # Routing por tipo de mensaje
        if "sensores" in topic:
            await self._handle_sensor_data(payload)
        elif "rfid" in topic:
            await self._handle_rfid_data(payload)
        elif "riego" in topic:
            await self._handle_irrigation_data(payload)
    
    async def _handle_sensor_data(self, payload):
        """Procesar datos de sensores"""
        async with get_db_session() as db:
            reading = SensorReading(
                sensor_id=payload.get('device_id'),
                temperatura=payload.get('readings', {}).get('temperatura'),
                humedad=payload.get('readings', {}).get('humedad'),
                presion=payload.get('readings', {}).get('presion'),
                battery_level=payload.get('battery'),
                signal_strength=payload.get('signal_strength')
            )
            db.add(reading)
            await db.commit()
    
    async def _handle_rfid_data(self, payload):
        """Procesar lecturas RFID"""
        # Guardar en tabla trazabilidad
        print(f"RFID: {payload}")
    
    async def _handle_irrigation_data(self, payload):
        """Procesar eventos de riego"""
        # Guardar en tabla eventos_riego
        print(f"Riego: {payload}")
    
    async def publish(self, topic: str, payload: dict, qos: int = 1):
        """Publicar mensaje MQTT"""
        if self.client:
            await self.client.publish(
                topic,
                json.dumps(payload).encode(),
                qos=qos
            )
