//
// @types/express.d.ts
//

import { WebSocketService } from '../services/websocket.service';

// Estende a interface Request do Express
declare global {
    namespace Express {
        export interface Request {
            // Adiciona a propriedade 'user' que conterá o payload decodificado do JWT
            user?: {
                userId: string;
                idCasa: string;
            };
            // Adiciona a propriedade 'wsService' para acesso global ao serviço de WebSocket
            wsService: WebSocketService;
        }
    }
}