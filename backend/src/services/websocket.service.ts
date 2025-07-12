import { WebSocketServer, WebSocket } from 'ws';
import { Table } from '../models/table.model';
import { User } from '../models/user.model';

// Este serviço gerencia as conexões e o envio de mensagens via WebSocket
export class WebSocketService {
    private wss: WebSocketServer;
    public activeConnections: Map<string, WebSocket> = new Map();

    constructor(wss: WebSocketServer) {
        this.wss = wss;
    }

    addConnection(idCasa: string, ws: WebSocket) {
        this.activeConnections.set(idCasa, ws);
        console.log(`Cliente ${idCasa} conectado. Conexões ativas: ${this.activeConnections.size}`);
    }

    removeConnection(idCasa: string) {
        this.activeConnections.delete(idCasa);
        console.log(`Cliente ${idCasa} desconectado. Conexões ativas: ${this.activeConnections.size}`);
    }

    // Envia o estado atualizado do mapa para todos os clientes conectados
    async broadcastMapUpdate() {
        try {
            const tables = await Table.find({});
            // 1. Buscar também os creditos_especiais
            const users = await User.find({}, 'idCasa creditos creditos_especiais');
 
            // 2. Montar o objeto com ambos os créditos
            const usersCreditsMap = users.reduce((acc, user) => {
                acc[user.idCasa] = { creditos: user.creditos, creditos_especiais: user.creditos_especiais };
                return acc;
            }, {} as Record<string, { creditos: number, creditos_especiais: number }>);

            const message = JSON.stringify({
                type: 'map-update',
                payload: {
                    tables,
                    usersCredits: usersCreditsMap,
                }
            });

            this.wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } catch (error) {
            console.error("Erro ao transmitir atualização do mapa:", error);
        }
    }
}