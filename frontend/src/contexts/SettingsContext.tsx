
// -----------------------------------------------------------------------------
// Arquivo: src/contexts/SettingsContext.tsx (NOVO)
// -----------------------------------------------------------------------------
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ISettings, SettingsContextType } from '../types';
import { getActiveEvents } from '../api/eventService';

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [events, setEvents] = useState<ISettings[]>([]);
    const [activeEventId, setActiveEventId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getActiveEvents();
                setEvents(data);
                if (data.length > 0) {
                    setActiveEventId(data[0].id);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const settings = React.useMemo(() => {
        if (!activeEventId || events.length === 0) return null;
        return events.find(e => e.id === activeEventId) || null;
    }, [events, activeEventId]);

    return (
        <SettingsContext.Provider value={{ settings, events, setActiveEventId, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
};
