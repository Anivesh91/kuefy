import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const activeSubsRef = useRef(new Map());

  const emitSub = (sock, sub) => {
    if (!sock || !sock.connected) return;
    switch (sub.type) {
      case 'ticket':
        sock.emit('join:ticket', sub.payload);
        break;
      case 'service':
        sock.emit('join:service', sub.payload);
        break;
      case 'owner':
        sock.emit('join:owner', sub.payload);
        break;
      case 'org':
        sock.emit('join:org', sub.payload);
        break;
      case 'directory':
        sock.emit('join:directory');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const socketInstance = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket.IO] Connected:', socketInstance.id);

      // Re-subscribe to all active rooms on initial connect and reconnects
      activeSubsRef.current.forEach((sub) => {
        emitSub(socketInstance, sub);
      });
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[Socket.IO] Disconnected:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('[Socket.IO] Connection error:', error.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinTicketRoom = useCallback((publicToken, ticketId) => {
    const key = `ticket:${ticketId || publicToken}`;
    const sub = { type: 'ticket', payload: { publicToken, ticketId } };
    activeSubsRef.current.set(key, sub);
    if (socket && socket.connected) {
      emitSub(socket, sub);
    }
  }, [socket]);

  const leaveTicketRoom = useCallback((ticketId) => {
    if (!ticketId) return;
    const key = `ticket:${ticketId}`;
    activeSubsRef.current.delete(key);
    if (socket && socket.connected) {
      socket.emit('leave:ticket', { ticketId });
    }
  }, [socket]);

  const joinServiceRoom = useCallback((serviceId) => {
    if (!serviceId) return;
    const key = `service:${serviceId}`;
    const sub = { type: 'service', payload: { serviceId } };
    activeSubsRef.current.set(key, sub);
    if (socket && socket.connected) {
      emitSub(socket, sub);
    }
  }, [socket]);

  const leaveServiceRoom = useCallback((serviceId) => {
    if (!serviceId) return;
    const key = `service:${serviceId}`;
    activeSubsRef.current.delete(key);
    if (socket && socket.connected) {
      socket.emit('leave:service', { serviceId });
    }
  }, [socket]);

  const joinOwnerRoom = useCallback((ownerId) => {
    const token = localStorage.getItem('kuefy_token') || localStorage.getItem('queueless_token');
    if (!token) return;
    const key = 'owner';
    const sub = { type: 'owner', payload: { ownerId, token } };
    activeSubsRef.current.set(key, sub);
    if (socket && socket.connected) {
      emitSub(socket, sub);
    }
  }, [socket]);

  const leaveOwnerRoom = useCallback(() => {
    const token = localStorage.getItem('kuefy_token') || localStorage.getItem('queueless_token');
    activeSubsRef.current.delete('owner');
    if (socket && socket.connected) {
      socket.emit('leave:owner', { token });
    }
  }, [socket]);

  const joinOrgRoom = useCallback((orgId) => {
    if (!orgId) return;
    const key = `org:${orgId}`;
    const sub = { type: 'org', payload: { orgId } };
    activeSubsRef.current.set(key, sub);
    if (socket && socket.connected) {
      emitSub(socket, sub);
    }
  }, [socket]);

  const leaveOrgRoom = useCallback((orgId) => {
    if (!orgId) return;
    const key = `org:${orgId}`;
    activeSubsRef.current.delete(key);
    if (socket && socket.connected) {
      socket.emit('leave:org', { orgId });
    }
  }, [socket]);

  const joinDirectoryRoom = useCallback(() => {
    const key = 'directory';
    const sub = { type: 'directory' };
    activeSubsRef.current.set(key, sub);
    if (socket && socket.connected) {
      emitSub(socket, sub);
    }
  }, [socket]);

  const leaveDirectoryRoom = useCallback(() => {
    activeSubsRef.current.delete('directory');
    if (socket && socket.connected) {
      socket.emit('leave:directory');
    }
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinTicketRoom,
        leaveTicketRoom,
        joinServiceRoom,
        leaveServiceRoom,
        joinOwnerRoom,
        leaveOwnerRoom,
        joinOrgRoom,
        leaveOrgRoom,
        joinDirectoryRoom,
        leaveDirectoryRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
