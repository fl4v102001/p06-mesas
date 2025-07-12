// -----------------------------------------------------------------------------
// Arquivo: src/contexts/AuthContext.tsx
// -----------------------------------------------------------------------------
import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { AuthContextType } from '../types';
import { logoutUser } from '../api/authService'; // Certifique-se de que o caminho está correto

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [idCasa, setIdCasa] = useState<string | null>(localStorage.getItem('idCasa'));

    const login = (newToken: string, newIdCasa: string) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('idCasa', newIdCasa);
        setToken(newToken);
        setIdCasa(newIdCasa);
    };

    const performLocalLogout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('idCasa');
        setToken(null);
        setIdCasa(null);
    }, []);

    const logout = useCallback(async () => {
        if (!token) return;
        try {
            await logoutUser(token);
        } catch (error) {
            console.error("Falha ao comunicar com o servidor para logout:", error);
            // Mesmo com erro, o logout local é feito no `finally`
        } finally {
            // Garante que o usuário seja deslogado da interface, independentemente do sucesso da API
            performLocalLogout();
        }
    }, [token, performLocalLogout]);

    const authContextValue = { token, idCasa, login, logout };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};