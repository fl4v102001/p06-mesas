
// -----------------------------------------------------------------------------
// Arquivo: src/contexts/SettingsContext.tsx (NOVO)
// -----------------------------------------------------------------------------
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ISettings, SettingsContextType } from '../types';
import { getSettings } from '../api/configService';

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<ISettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSettings();
                setSettings(data);
            } catch (error) {
                console.error(error);
                // Poderíamos ter um estado de erro aqui também
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
};
