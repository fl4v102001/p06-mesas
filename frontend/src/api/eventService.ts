import { API_URL } from '../constants';
import { ISettings } from '../types';

export const getActiveEvents = async (): Promise<ISettings[]> => {
    const response = await fetch(`${API_URL}/api/events`);
    if (!response.ok) {
        throw new Error('Falha ao carregar os eventos.');
    }
    return response.json();
};
