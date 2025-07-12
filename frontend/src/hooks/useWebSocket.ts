
// -----------------------------------------------------------------------------
// Arquivo: src/hooks/useWebSocket.ts
// -----------------------------------------------------------------------------
import { useState, useEffect, useRef } from 'react';
import { WEBSOCKET_URL } from '../constants';
import { TableData, MapUpdatePayload, UserCreditsData } from '../types';

export const useWebSocket = (token: string | null) => {
    const [tables, setTables] = useState<TableData[]>([]);
    const [usersCredits, setUsersCredits] = useState<Record<string, UserCreditsData>>({});
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!token) return;

        ws.current = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);

        ws.current.onopen = () => {
            console.log('WebSocket Conectado');
            setIsConnected(true);
        };

        ws.current.onclose = () => {
            console.log('WebSocket Desconectado');
            setIsConnected(false);
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'map-update') {
                const payload: MapUpdatePayload = data.payload;
                setTables(payload.tables);
                setUsersCredits(payload.usersCredits);
            }
        };

        // Cleanup function
        return () => {
            ws.current?.close();
        };
    }, [token]);

    const sendMessage = (message: object) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        }
    };

    return { tables, usersCredits, sendMessage, isConnected };
};

