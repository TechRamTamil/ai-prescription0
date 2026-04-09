"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only establish socket if user is logged in
    if (!user) {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    // Construct WebSocket URL from API URL
    const clientId = user.id || Math.floor(Math.random() * 10000);
    const wsUrl = apiUrl.replace("http", "ws") + `/ws/${clientId}`;
    
    console.log(`Connecting to WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected successfully");
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket transport error:", error);
    };

    setSocket(ws);

    // Cleanup on unmount or user logout
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
