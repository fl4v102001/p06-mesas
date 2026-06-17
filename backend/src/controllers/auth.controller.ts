import { Request, Response } from 'express';
// Controlador para autenticação de usuários
import {
    loginUserService,
    releaseUserTablesOnLogout
} from '../services/auth.service';



export const login = async (req: Request, res: Response) => {
    try {
        const { idCasa } = req.body;
        const { token, user } = await loginUserService(idCasa);
        res.json({ token, idCasa: user.codigoLote, creditos: user.qtyCredits, creditos_especiais: user.mustPay });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};


/**
 * Processa o logout do usuário, libera suas mesas e notifica os clientes.
 */
export const logout = async (req: Request, res: Response) => {
    try {
        // O ID do usuário é obtido a partir do token verificado pelo middleware
        const userId = req.user?.userId;
        const idCasa = req.user?.idCasa;

        if (!userId || !idCasa) {
            return res.status(400).json({ message: 'Informação de usuário ausente no token.' });
        }

        // Chama o serviço para liberar as mesas e devolver os créditos
        // Passando ambos os identificadores
        await releaseUserTablesOnLogout(userId, idCasa);

        // Notifica todos os clientes sobre a atualização do mapa
        await req.wsService.broadcastMapUpdate();
        
        // Remove a conexão ativa do WebSocket para este usuário
        req.wsService.removeConnection(idCasa);

        res.status(200).json({ message: 'Logout realizado com sucesso e mesas liberadas.' });

    } catch (error: any) {
        res.status(500).json({ message: 'Erro no servidor durante o logout.', error: error.message });
    }
};
