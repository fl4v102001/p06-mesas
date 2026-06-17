// -----------------------------------------------------------------------------
// Arquivo: src/controllers/settings.controller.ts (NOVO)
// -----------------------------------------------------------------------------
import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { EventEntity } from '../models/postgres/Event.entity';
/**
 * Obtém o documento de configuração único do sistema.
 */
export const getSettings = async (req: Request, res: Response) => {
    try {
        const eventRepository = AppDataSource.getRepository(EventEntity);
        const settings = await eventRepository.findOne({ where: { status: 'ativo' } });
        if (!settings) {
            // Isto não deve acontecer se a inicialização do servidor funcionar corretamente
            return res.status(404).json({ message: 'Configurações não encontradas.' });
        }
        res.status(200).json(settings);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao obter as configurações.', error: error.message });
    }
};
