import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { EventEntity } from '../models/postgres/Event.entity';
import { getEventStatus, getEventSeatsReport, getConsolidatedSeatsReport } from '../services/event.service';

export const getActiveEvents = async (req: Request, res: Response) => {
    try {
        const eventRepository = AppDataSource.getRepository(EventEntity);
        const events = await eventRepository.find({ where: { status: 'ativo' } });
        res.status(200).json(events);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao obter os eventos.', error: error.message });
    }
};

export const getEventStatusController = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id as string;
        const idEvent = parseInt(idParam, 10);

        if (isNaN(idEvent)) {
            return res.status(400).json({ message: 'id_event inválido.' });
        }

        const status = await getEventStatus(idEvent);
        res.status(200).json(status);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao obter o status do evento.', error: error.message });
    }
};

export const getEventSeatsReportController = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id as string;
        const idEvent = parseInt(idParam, 10);

        if (isNaN(idEvent)) {
            return res.status(400).json({ message: 'id_event inválido.' });
        }

        const report = await getEventSeatsReport(idEvent);
        res.status(200).json(report);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao obter o relatório de mesas do evento.', error: error.message });
    }
};

export const getConsolidatedSeatsReportController = async (req: Request, res: Response) => {
    try {
        const report = await getConsolidatedSeatsReport();
        res.status(200).json(report);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao obter o relatório consolidado de mesas do evento.', error: error.message });
    }
};

