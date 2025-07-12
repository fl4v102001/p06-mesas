import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';

import { config } from './config';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import { initializeTables } from './services/table.service';
import { WebSocketService } from './services/websocket.service';
import { handleConnection } from './controllers/websocket.controller';

const startServer = async () => {
    await connectDB(config.mongodbUri);
    await initializeTables();

    const app = express();
    app.use(cors());
    app.use(express.json());

    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });
    const wsService = new WebSocketService(wss);

    // Middleware para injetar o wsService em todas as requisições
    app.use((req, res, next) => {
        req.wsService = wsService;
        next();
    });

    // Rotas da API
    app.use('/api/auth', authRoutes);

    wss.on('connection', (ws, req) => {
        handleConnection(ws, req, wsService);
    });

    server.listen(config.port, () => {
        console.log(`Servidor HTTP e WebSocket rodando na porta ${config.port}`);
    });
};

startServer();