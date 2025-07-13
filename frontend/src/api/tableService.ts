// -----------------------------------------------------------------------------
// Arquivo: src/api/tableService.ts (NOVO)
// -----------------------------------------------------------------------------
import { API_URL } from '../constants';

export const purchaseTables = async (token: string) => {
    const response = await fetch(`${API_URL}/api/tables/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao confirmar a compra.');
    }

    return response.json();
};
