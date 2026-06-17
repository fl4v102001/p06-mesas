
// -----------------------------------------------------------------------------
// Arquivo: src/hooks/useWebSocket.ts
// -----------------------------------------------------------------------------
import { useState, useEffect, useRef } from 'react';
import { WEBSOCKET_URL } from '../constants';
import { TableData, MapUpdatePayload, UserCreditsData } from '../types';

export const useWebSocket = (token: string | null, eventId: string | null) => {
    const [tables, setTables] = useState<TableData[]>([]);
    const [usersCredits, setUsersCredits] = useState<Record<string, UserCreditsData>>({});
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const [initialEventId] = useState(eventId); // Capture initial eventId for connection

    useEffect(() => {
        if (!token || !initialEventId) return;

        ws.current = new WebSocket(`${WEBSOCKET_URL}?token=${token}&eventId=${initialEventId}`);

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

        // Cleanup function only runs on unmount or token change
        return () => {
            ws.current?.close();
        };
    }, [token, initialEventId]);

    // Lida com a troca de eventos sem desconectar
    useEffect(() => {
        if (!eventId) return;

        setTables([]);
        setUsersCredits({});

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'trocarEvento', payload: { eventId } }));
        } else if (ws.current && ws.current.readyState === WebSocket.CONNECTING) {
            // Se ainda estiver conectando, enviará no onopen se necessário
            const onOpenOriginal = ws.current.onopen;
            ws.current.onopen = (e) => {
                if (onOpenOriginal && ws.current) onOpenOriginal.call(ws.current, e);
                ws.current?.send(JSON.stringify({ type: 'trocarEvento', payload: { eventId } }));
            };
        }
    }, [eventId]);

    const sendMessage = (message: object) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        }
    };

    return { tables, usersCredits, sendMessage, isConnected };
};

