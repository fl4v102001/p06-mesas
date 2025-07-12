import { WebSocket } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import { WebSocketService } from '../services/websocket.service';
import { handleTableClickService } from '../services/table.service';
import { config } from '../config';

// Função que gerencia uma nova conexão WebSocket
export const handleConnection = (ws: WebSocket, req: http.IncomingMessage, wsService: WebSocketService) => {
    const token = req.url?.split('token=')[1];
    if (!token) {
        ws.close(1008, 'Token não fornecido');
        return;
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { idCasa: string };
        const { idCasa } = decoded;

        wsService.addConnection(idCasa, ws);

        // Envia o estado inicial assim que o cliente se conecta
        wsService.broadcastMapUpdate();

        ws.on('message', async (message: string) => {
            try {
                const data = JSON.parse(message);
                
                if (data.type === 'cliqueMesa') {
                    await handleTableClickService(idCasa, data.payload.linha, data.payload.coluna);
                    // Após a lógica de negócio, atualiza todos os clientes
                    await wsService.broadcastMapUpdate();
                }
            } catch (error) {
                console.error('Erro ao processar mensagem WebSocket:', error);
                // Opcional: enviar uma mensagem de erro para o cliente
                ws.send(JSON.stringify({ type: 'error', message: 'Ocorreu um erro no servidor.' }));
            }
        });

        ws.on('close', () => {
            wsService.removeConnection(idCasa);
        });

    } catch (error) {
        ws.close(1008, 'Token inválido');
    }
};
