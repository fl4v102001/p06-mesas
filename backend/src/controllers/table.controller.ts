// -----------------------------------------------------------------------------
// Arquivo: src/controllers/table.controller.ts (NOVO)
// -----------------------------------------------------------------------------
import { Request, Response } from 'express';
import { purchaseSelectedTables } from '../services/table.service';

/**
 * Processa a compra das mesas selecionadas pelo usuário autenticado.
 */
export const purchaseTablesController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const idCasa = req.user?.idCasa;
        const eventIdParam = req.body?.eventId;

        if (!userId || !idCasa) {
            return res.status(400).json({ message: 'Informação de usuário ausente no token.' });
        }

        if (!eventIdParam) {
            return res.status(400).json({ message: 'eventId não fornecido na requisição.' });
        }

        const eventId = parseInt(eventIdParam, 10);
        if (isNaN(eventId)) {
            return res.status(400).json({ message: 'eventId inválido.' });
        }

        await purchaseSelectedTables(userId, idCasa, eventId);

        // Notifica os clientes sobre a atualização do mapa focado no evento atual
        await req.wsService.broadcastMapUpdate(eventId);

        res.status(200).json({ message: 'Compra realizada com sucesso!' });

    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao processar a compra.', error: error.message });
    }
};
