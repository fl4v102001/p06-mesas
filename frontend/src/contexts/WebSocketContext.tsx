
// -----------------------------------------------------------------------------
// Arquivo: src/contexts/WebSocketContext.tsx
// -----------------------------------------------------------------------------
import React, { createContext, useContext, ReactNode } from 'react';
import { WebSocketContextType } from '../types';
import { AuthContext } from './AuthContext';
import { SettingsContext } from './SettingsContext';
import { useWebSocket } from '../hooks/useWebSocket';

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useContext(AuthContext);
    const settingsCtx = useContext(SettingsContext);
    const { tables, usersCredits, sendMessage, isConnected } = useWebSocket(auth?.token || null, settingsCtx?.settings?.id || null);

    const idCasa = auth?.idCasa;
    const creditsData = idCasa ? usersCredits[idCasa] : null;
    const totalUserCredits = creditsData ? creditsData.creditos + creditsData.creditos_especiais : 0;

    const webSocketContextValue = {
        tables,
        userCredits: totalUserCredits,
        sendMessage,
        isConnected,
    };

    return (
        <WebSocketContext.Provider value={webSocketContextValue}>
            {children}
        </WebSocketContext.Provider>
    );
};

