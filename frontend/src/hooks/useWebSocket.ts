import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(url: string) {
  const [data, setData] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Convertir WebSocket URL a Socket.IO
    const wsUrl = url.replace('ws://', 'http://').replace('/ws/telemetry', '');
    const newSocket = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    newSocket.on('connect', () => {
      console.log('✓ WebSocket conectado');
    });

    newSocket.on('telemetry', (newData) => {
      setData(newData);
    });

    newSocket.on('disconnect', () => {
      console.log('✗ WebSocket desconectado');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [url]);

  return data;
}

// Hook alternativo para WebSocket nativo
export function useWebSocketNative(url: string) {
  const [data, setData] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const websocket = new WebSocket(url);

    websocket.onopen = () => {
      console.log('✓ WebSocket conectado');
    };

    websocket.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('✗ WebSocket cerrado, reconectando...');
      // Reconectar después de 3 segundos
      setTimeout(() => {
        setWs(null);
      }, 3000);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [url]);

  return data;
}
