import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '../hooks/useWebSocket';
import StatsCard from '../components/StatsCard';
import SensorChart from '../components/SensorChart';
import MapView from '../components/MapView';
import AlertsList from '../components/AlertsList';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  ExclamationTriangleIcon,
  SignalIcon 
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/v1/stats');
      return response.json();
    },
    refetchInterval: 5000
  });

  const telemetry = useWebSocket('ws://localhost:8000/ws/telemetry');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard IoT Agroindustrial
        </h1>
        <p className="mt-2 text-gray-600">
          Sistema de monitoreo en tiempo real - 8 Sedes
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Sensores Activos"
          value={telemetry?.sensors_active || 0}
          icon={<CpuChipIcon className="h-8 w-8" />}
          color="blue"
          trend="+2.5%"
        />
        <StatsCard
          title="Zonas de Riego"
          value="12"
          icon={<ChartBarIcon className="h-8 w-8" />}
          color="green"
          subtitle="3 activas ahora"
        />
        <StatsCard
          title="Alertas Pendientes"
          value={telemetry?.alerts_pending || 0}
          icon={<ExclamationTriangleIcon className="h-8 w-8" />}
          color="yellow"
          trend={telemetry?.alerts_pending > 0 ? 'Requiere atención' : 'Todo normal'}
        />
        <StatsCard
          title="Conectividad"
          value="98.5%"
          icon={<SignalIcon className="h-8 w-8" />}
          color="green"
          subtitle="8/8 sedes online"
        />
      </div>

      {/* Gráficos y Mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Temperatura */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Temperatura Promedio por Sede
          </h2>
          <SensorChart metric="temperatura" />
        </div>

        {/* Mapa de Sedes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Ubicación de Sedes
          </h2>
          <MapView />
        </div>
      </div>

      {/* Gráfico de Humedad */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          Humedad del Suelo - Última Hora
        </h2>
        <SensorChart metric="humedad" timeRange="1h" />
      </div>

      {/* Alertas Recientes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          Alertas Recientes
        </h2>
        <AlertsList limit={5} />
      </div>
    </div>
  );
}
