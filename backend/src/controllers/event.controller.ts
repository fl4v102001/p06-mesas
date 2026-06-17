import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { EventEntity } from '../models/postgres/Event.entity';

export const getActiveEvents = async (req: Request, res: Response) => {
    try {
        const eventRepository = AppDataSource.getRepository(EventEntity);
        const events = await eventRepository.find({ where: { status: 'ativo' } });
        res.status(200).json(events);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao obter os eventos.', error: error.message });
    }
};
