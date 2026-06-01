import { useEffect } from 'react';
import { io } from 'socket.io-client';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Strip /api/v1 or trailing slashes for the root WebSocket connection
const socketBaseURL = apiURL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

export const socket = io(socketBaseURL, {
  withCredentials: true,
  autoConnect: true
});

export const useAdminSocket = (onOrderNew, onStatusUpdate) => {
  useEffect(() => {
    socket.emit('join:admin');
    
    if (onOrderNew) socket.on('order:new', onOrderNew);
    if (onStatusUpdate) socket.on('order:status_updated', onStatusUpdate);

    return () => {
      if (onOrderNew) socket.off('order:new', onOrderNew);
      if (onStatusUpdate) socket.off('order:status_updated', onStatusUpdate);
    };
  }, [onOrderNew, onStatusUpdate]);
};

export const useRiderSocket = (riderId, onAssigned, onCancelled) => {
  useEffect(() => {
    if (!riderId) return;
    socket.emit('join:rider', riderId);
    
    if (onAssigned) socket.on('order:assigned', onAssigned);
    if (onCancelled) socket.on('order:cancelled', onCancelled);

    return () => {
      if (onAssigned) socket.off('order:assigned', onAssigned);
      if (onCancelled) socket.off('order:cancelled', onCancelled);
    };
  }, [riderId, onAssigned, onCancelled]);
};
export default socket;
