import { WebSocketServer, WebSocket } from 'ws';
import { AppDataSource } from '../config/data-source';
import { SeatEntity } from '../models/postgres/Seat.entity';
import { CreditEntity } from '../models/postgres/Credit.entity';

// Este serviço gerencia as conexões e o envio de mensagens via WebSocket
export class WebSocketService {
    private wss: WebSocketServer;
    public activeConnections: Map<string, { ws: WebSocket, eventId: number }> = new Map();

    constructor(wss: WebSocketServer) {
        this.wss = wss;
    }

    addConnection(idCasa: string, ws: WebSocket, eventId: number) {
        this.activeConnections.set(idCasa, { ws, eventId });
        console.log(`Cliente ${idCasa} conectado ao evento ${eventId}. Conexões ativas: ${this.activeConnections.size}`);
    }

    removeConnection(idCasa: string) {
        this.activeConnections.delete(idCasa);
        console.log(`Cliente ${idCasa} desconectado. Conexões ativas: ${this.activeConnections.size}`);
    }

    // Envia o estado atualizado do mapa para os clientes conectados a um evento específico ou a todos
    async broadcastMapUpdate(eventId?: number) {
        try {
            const seatRepository = AppDataSource.getRepository(SeatEntity);
            const creditRepository = AppDataSource.getRepository(CreditEntity);

            // Se eventId não foi fornecido, descobre quais eventos têm clientes conectados
            // e chama o próprio método recursivamente para cada evento.
            if (eventId === undefined) {
                const activeEvents = new Set<number>();
                this.activeConnections.forEach(conn => activeEvents.add(conn.eventId));
                for (const evId of activeEvents) {
                    await this.broadcastMapUpdate(evId);
                }
                return;
            }

            const tables = await seatRepository.find({ where: { idEvent: eventId } });
            const credits = await creditRepository.find();
 
            // 2. Montar o objeto com ambos os créditos
            const usersCreditsMap = credits.reduce((acc, credit) => {
                acc[credit.codigoLote] = { creditos: credit.qtyCredits, creditos_especiais: credit.mustPay };
                return acc;
            }, {} as Record<string, { creditos: number, creditos_especiais: number }>);

            const message = JSON.stringify({
                type: 'map-update',
                payload: {
                    tables,
                    usersCredits: usersCreditsMap,
                }
            });

            this.activeConnections.forEach((connection, idCasa) => {
                if (connection.eventId === eventId && connection.ws.readyState === WebSocket.OPEN) {
                    connection.ws.send(message);
                }
            });
        } catch (error) {
            console.error("Erro ao transmitir atualização do mapa:", error);
        }
    }
}