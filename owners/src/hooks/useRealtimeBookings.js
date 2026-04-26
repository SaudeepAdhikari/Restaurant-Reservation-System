import { useEffect } from 'react';
import { connectOwnerSocket, disconnectOwnerSocket } from '../services/socketClient';

export default function useRealtimeBookings(ownerId, onBookingEvent) {
  useEffect(() => {
    if (!ownerId || typeof onBookingEvent !== 'function') return undefined;

    const socket = connectOwnerSocket(ownerId);

    const handleNewRequest = (payload) => onBookingEvent('new_request', payload);
    const handleCreated = (payload) => onBookingEvent('created', payload);
    const handleUpdated = (payload) => onBookingEvent('updated', payload);

    socket.on('booking:new_request', handleNewRequest);
    socket.on('booking:created', handleCreated);
    socket.on('booking:updated', handleUpdated);

    return () => {
      socket.off('booking:new_request', handleNewRequest);
      socket.off('booking:created', handleCreated);
      socket.off('booking:updated', handleUpdated);
      disconnectOwnerSocket();
    };
  }, [ownerId, onBookingEvent]);
}
