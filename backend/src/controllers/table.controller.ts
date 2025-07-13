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

        if (!userId || !idCasa) {
            return res.status(400).json({ message: 'Informação de usuário ausente no token.' });
        }

        await purchaseSelectedTables(userId, idCasa);

        // Notifica todos os clientes sobre a atualização do mapa
        await req.wsService.broadcastMapUpdate();

        res.status(200).json({ message: 'Compra realizada com sucesso!' });

    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao processar a compra.', error: error.message });
    }
};
