import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface SensorChartProps {
  metric: 'temperatura' | 'humedad' | 'presion';
  timeRange?: '1h' | '24h' | '7d';
}

export default function SensorChart({ metric, timeRange = '24h' }: SensorChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['sensor-chart', metric, timeRange],
    queryFn: async () => {
      // Simulación de datos - reemplazar con API real
      const now = Date.now();
      const points = timeRange === '1h' ? 12 : timeRange === '24h' ? 24 : 168;
      
      return Array.from({ length: points }, (_, i) => ({
        time: new Date(now - (points - i) * 60 * 60 * 1000).toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        Tunja: 20 + Math.random() * 10,
        Bogotá: 22 + Math.random() * 8,
        Duitama: 18 + Math.random() * 12,
        Sogamoso: 19 + Math.random() * 11
      }));
    },
    refetchInterval: 30000 // Actualizar cada 30s
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          label={{ 
            value: metric === 'temperatura' ? '°C' : metric === 'humedad' ? '%' : 'hPa', 
            angle: -90, 
            position: 'insideLeft' 
          }}
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Tunja" stroke="#8884d8" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Bogotá" stroke="#82ca9d" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Duitama" stroke="#ffc658" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Sogamoso" stroke="#ff7c7c" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
