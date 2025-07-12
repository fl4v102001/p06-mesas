
// -----------------------------------------------------------------------------
// Arquivo: src/api/authService.ts
// -----------------------------------------------------------------------------
import { API_URL } from '../constants';
import { RegisterFormData } from '../types';

export const loginUser = async (idCasa: string, senha: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCasa, senha }),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao fazer login.');
    }
    return response.json();
};

export const registerUser = async (formData: RegisterFormData) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao registar.');
    }
    return response.json();
};

// Nova função para o logout no backend
export const logoutUser = async (token: string) => {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao fazer logout.');
    } else {console.log('Logout realizado com sucesso Backend');}
    return response.json();
};
