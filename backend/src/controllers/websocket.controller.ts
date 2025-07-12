import { WebSocket } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { WebSocketService } from '../services/websocket.service';
import { handleTableClickService } from '../services/table.service';
import { releaseUserTablesOnLogout } from '../services/auth.service';

/**
 * Lida com uma nova conexão WebSocket, incluindo autenticação e tratamento de eventos.
 */
export const handleConnection = (ws: WebSocket, req: http.IncomingMessage, wsService: WebSocketService) => {
    const token = req.url?.split('token=')[1];
    if (!token) {
        ws.close(1008, 'Token não fornecido');
        return;
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; idCasa: string; };
        const { userId, idCasa } = decoded;

        wsService.addConnection(idCasa, ws);
        wsService.broadcastMapUpdate();

        // Lida com mensagens recebidas do cliente
        ws.on('message', async (message: string) => {
            try {
                const data = JSON.parse(message);
                
                if (data.type === 'cliqueMesa') {
                    await handleTableClickService(idCasa, data.payload.linha, data.payload.coluna);
                    await wsService.broadcastMapUpdate();
                }
            } catch (error) {
                console.error('Erro ao processar mensagem WebSocket:', error);
            }
        });

        // Lida com o fecho da conexão (browser fechado, perda de rede, etc.)
        ws.on('close', async () => {
            console.log(`Cliente ${idCasa} desconectado. Iniciando limpeza de mesas...`);
            try {
                // Chama a mesma função de serviço usada pelo logout explícito
                await releaseUserTablesOnLogout(userId, idCasa);

                // Remove a conexão da lista de conexões ativas
                wsService.removeConnection(idCasa);

                // Notifica todos os outros clientes que as mesas foram liberadas
                await wsService.broadcastMapUpdate();

                console.log(`Limpeza para ${idCasa} concluída com sucesso.`);
            } catch (error) {
                console.error(`Erro ao liberar mesas para ${idCasa} após desconexão inesperada:`, error);
            }
        });

    } catch (error) {
        ws.close(1008, 'Token inválido');
    }
};
