import { API_URL } from '../constants';
import { ISettings, EventStatus, EventSeatsReport } from '../types';

export const getActiveEvents = async (): Promise<ISettings[]> => {
    const response = await fetch(`${API_URL}/api/events`);
    if (!response.ok) {
        throw new Error('Falha ao carregar os eventos.');
    }
    return response.json();
};

export const getEventStatus = async (token: string, eventId: string): Promise<EventStatus> => {
    const response = await fetch(`${API_URL}/api/events/${eventId}/status`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Falha ao carregar o status do evento.');
    }

    return response.json();
};

export const getEventSeatsReport = async (token: string, eventId: string): Promise<EventSeatsReport[]> => {
    const response = await fetch(`${API_URL}/api/events/${eventId}/seats-report`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Falha ao carregar o relatório de assentos.');
    }

    return response.json();
};
