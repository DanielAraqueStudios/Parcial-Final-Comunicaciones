# Configuración LoRa/LoRaWAN

## Especificaciones Técnicas

### Parámetros de Red
- **Frecuencia**: 915 MHz (ISM Band Colombia)
- **Bandwidth**: 125 kHz
- **Spreading Factor**: SF7-SF12 (adaptativo)
- **Coding Rate**: 4/5
- **Potencia TX**: 14 dBm (25 mW)
- **Alcance**: hasta 15 km (campo abierto)

## Arquitectura LoRaWAN

```
Sensores LoRa → Gateway LoRa → Network Server → MQTT Broker
(Dispositivos)   (Raspberry Pi)  (ChirpStack)    (Mosquitto)
```

## Configuración Gateway

### Hardware
- **Modelo**: RAK7248 o similar
- **IP**: 10.0.6.10 (VLAN 40)
- **Concentrador**: SX1301/SX1302
- **Antena**: 3-5 dBi omnidireccional

### packet_forwarder (global_conf.json)
```json
{
  "SX130x_conf": {
    "com_type": "SPI",
    "com_path": "/dev/spidev0.0",
    "lorawan_public": true,
    "clksrc": 0,
    "antenna_gain": 3,
    "full_duplex": false,
    "radio_0": {
      "enable": true,
      "type": "SX1257",
      "freq": 915000000,
      "tx_enable": true
    }
  },
  "gateway_conf": {
    "gateway_ID": "AA555A0000000001",
    "server_address": "10.0.6.20",
    "serv_port_up": 1700,
    "serv_port_down": 1700
  }
}
```

## Dispositivos End-Node

### Configuración Sensor
- **DevEUI**: Único por sensor
- **AppEUI**: Por aplicación/sede
- **AppKey**: 128-bit AES key
- **Clase**: A (bajo consumo)
- **ADR**: Habilitado (Adaptive Data Rate)

### Ejemplo DevEUI Assignment
```
Tunja:
  sensor-001: 70B3D5499A123401
  sensor-002: 70B3D5499A123402

Bogotá:
  sensor-050: 70B3D5499A123450
```

## Network Server (ChirpStack)

### chirpstack.toml
```toml
[network]
net_id = "000001"
enabled_regions = ["us915_0"]

[network.band.us915_0]
enabled = true
uplink_channels = [0, 1, 2, 3, 4, 5, 6, 7]

[integration.mqtt]
server = "tcp://10.0.6.21:1883"
username = "lorawan"
password = "secured_password"
topic_prefix = "agricultura/{sede}/lora"
```

## Payload Decoder (JavaScript)

```javascript
function Decoder(bytes, port) {
  var decoded = {};
  
  if (port === 1) { // Temperatura y Humedad
    decoded.temperatura = ((bytes[0] << 8) | bytes[1]) / 100.0;
    decoded.humedad = ((bytes[2] << 8) | bytes[3]) / 100.0;
    decoded.battery = bytes[4];
  }
  
  return decoded;
}
```

## Consumo de Energía

| Modo | Corriente | Duración |
|------|-----------|----------|
| Sleep | 1.5 µA | Mayor parte del tiempo |
| TX (14dBm) | 120 mA | ~1 segundo cada 5 min |
| RX | 15 mA | ~2 segundos después de TX |

**Vida útil batería**: 2-3 años con 2xAA (3000 mAh)
