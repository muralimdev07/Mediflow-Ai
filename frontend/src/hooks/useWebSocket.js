import { useEffect, useRef } from 'react';
import { WS_BASE_URL } from '../utils/constants';
import { useAuthStore } from '../store/authStore';

export const useWebSocket = (channels = [], onEvent = null) => {
  const { user } = useAuthStore();
  const wsRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    const channelParam = channels.length > 0 ? `?channels=${channels.join(',')}` : '';
    const ws = new WebSocket(`${WS_BASE_URL}/${user.id}${channelParam}`);

    ws.onopen = () => {
      console.log('📡 WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (onEvent) {
          onEvent(payload.event, payload.data);
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    ws.onclose = () => {
      console.log('📡 WebSocket disconnected');
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [user?.id, channels.join(',')]);

  const send = (action, data = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action, ...data }));
    }
  };

  return { send };
};
