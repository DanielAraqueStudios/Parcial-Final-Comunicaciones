import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlayIcon, StopIcon, PauseIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

interface IrrigationZone {
  zona_id: number;
  nombre: string;
  campo_nombre: string;
  sede_nombre: string;
  area_hectareas: number;
  tipo_riego: string;
  estado: string;
}

export default function Irrigation() {
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [duration, setDuration] = useState(30);
  const queryClient = useQueryClient();

  const { data: zones } = useQuery({
    queryKey: ['irrigation-zones'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/v1/irrigation/zones');
      return response.data as IrrigationZone[];
    }
  });

  const { data: status } = useQuery({
    queryKey: ['irrigation-status'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/v1/irrigation/status');
      return response.data;
    },
    refetchInterval: 5000
  });

  const commandMutation = useMutation({
    mutationFn: async ({ zona_id, action, duration_minutes }: any) => {
      return axios.post('http://localhost:8000/api/v1/irrigation/command', {
        zona_id,
        action,
        duration_minutes,
        reason: 'Manual desde dashboard'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['irrigation-status'] });
      alert('Comando enviado exitosamente');
    }
  });

  const handleCommand = (zona_id: number, action: string) => {
    if (action === 'start' && !duration) {
      alert('Especifica la duración en minutos');
      return;
    }
    
    if (confirm(`¿Confirmar ${action} para zona ${zona_id}?`)) {
      commandMutation.mutate({
        zona_id,
        action,
        duration_minutes: action === 'start' ? duration : null
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Sistema de Riego Automatizado
        </h1>
        <p className="mt-2 text-gray-600">
          Control y monitoreo de zonas de riego
        </p>
      </div>

      {/* Estado General */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Estado General</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {status?.zonas_activas?.length || 0}
            </p>
            <p className="text-gray-600">Zonas Activas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {status?.estadisticas_hoy?.eventos_hoy || 0}
            </p>
            <p className="text-gray-600">Eventos Hoy</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {status?.estadisticas_hoy?.volumen_total || 0} L
            </p>
            <p className="text-gray-600">Volumen Total</p>
          </div>
        </div>
      </div>

      {/* Zonas de Riego */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {zones?.map((zone) => {
          const isActive = status?.zonas_activas?.some(
            (z: any) => z.zona_id === zone.zona_id
          );

          return (
            <div 
              key={zone.zona_id}
              className={`bg-white rounded-lg shadow p-6 border-2 ${
                isActive ? 'border-green-500' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{zone.nombre}</h3>
                  <p className="text-sm text-gray-600">
                    {zone.sede_nombre} - {zone.campo_nombre}
                  </p>
                  <p className="text-sm text-gray-500">
                    {zone.area_hectareas} ha • {zone.tipo_riego}
                  </p>
                </div>
                {isActive && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    Activo
                  </span>
                )}
              </div>

              {/* Controles */}
              <div className="space-y-3">
                {!isActive && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Duración (min)"
                    />
                    <button
                      onClick={() => handleCommand(zone.zona_id, 'start')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <PlayIcon className="h-5 w-5" />
                      <span>Iniciar</span>
                    </button>
                  </div>
                )}

                {isActive && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCommand(zone.zona_id, 'pause')}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                    >
                      <PauseIcon className="h-5 w-5" />
                      <span>Pausar</span>
                    </button>
                    <button
                      onClick={() => handleCommand(zone.zona_id, 'stop')}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <StopIcon className="h-5 w-5" />
                      <span>Detener</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
