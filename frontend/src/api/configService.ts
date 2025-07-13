// -----------------------------------------------------------------------------
// Arquivo: src/api/configService.ts (NOVO)
// -----------------------------------------------------------------------------
import { API_URL } from '../constants';

export const getSettings = async () => {
    const response = await fetch(`${API_URL}/api/config`);
    if (!response.ok) {
        throw new Error('Falha ao carregar as configurações do sistema.');
    }
    return response.json();
};
