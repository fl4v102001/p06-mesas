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
    const [isReadOnly, setIsReadOnly] = useState<boolean>(localStorage.getItem('isReadOnly') === 'true');

    const login = (newToken: string, newIdCasa: string, readOnly: boolean = false) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('idCasa', newIdCasa);
        localStorage.setItem('isReadOnly', String(readOnly));
        setToken(newToken);
        setIdCasa(newIdCasa);
        setIsReadOnly(readOnly);
    };

    const performLocalLogout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('idCasa');
        localStorage.removeItem('isReadOnly');
        setToken(null);
        setIdCasa(null);
        setIsReadOnly(false);
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

    const authContextValue = { token, idCasa, isReadOnly, login, logout };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};