import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const sedes = [
  { id: 1, name: 'Tunja', position: [5.5349, -73.3624] as [number, number], sensors: 150 },
  { id: 2, name: 'Duitama', position: [5.8269, -73.0334] as [number, number], sensors: 120 },
  { id: 3, name: 'Sogamoso', position: [5.7147, -72.9342] as [number, number], sensors: 98 },
  { id: 4, name: 'Chiquinquirá', position: [5.6172, -73.8186] as [number, number], sensors: 87 },
  { id: 5, name: 'Bogotá', position: [4.7110, -74.0721] as [number, number], sensors: 200 },
  { id: 6, name: 'Zipaquirá', position: [5.0220, -74.0042] as [number, number], sensors: 95 },
  { id: 7, name: 'Facatativá', position: [4.8139, -74.3547] as [number, number], sensors: 110 },
  { id: 8, name: 'Fusagasugá', position: [4.3390, -74.3637] as [number, number], sensors: 102 }
];

export default function MapView() {
  const center: [number, number] = [5.0, -73.5]; // Centro de Colombia

  return (
    <MapContainer 
      center={center} 
      zoom={8} 
      style={{ height: '400px', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {sedes.map((sede) => (
        <div key={sede.id}>
          <Marker position={sede.position}>
            <Popup>
              <div className="text-center">
                <h3 className="font-bold">{sede.name}</h3>
                <p className="text-sm">Sensores: {sede.sensors}</p>
                <p className="text-xs text-green-600">● Online</p>
              </div>
            </Popup>
          </Marker>
          <Circle
            center={sede.position}
            radius={5000}
            pathOptions={{ 
              color: 'green', 
              fillColor: 'lightgreen',
              fillOpacity: 0.2 
            }}
          />
        </div>
      ))}
    </MapContainer>
  );
}
