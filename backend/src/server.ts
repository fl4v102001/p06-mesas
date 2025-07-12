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
    // Conecta ao Banco de Dados
    await connectDB(config.mongodbUri);

    // Inicializa as mesas se necessário
    await initializeTables();

    // Configuração do Servidor Express
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Rotas da API
    app.use('/api/auth', authRoutes);

    // Criação dos servidores HTTP e WebSocket
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    // Instancia o serviço de WebSocket
    const wsService = new WebSocketService(wss);

    // Lida com novas conexões WebSocket
    wss.on('connection', (ws, req) => {
        handleConnection(ws, req, wsService);
    });

    // Inicia o servidor
    server.listen(config.port, () => {
        console.log(`Servidor HTTP e WebSocket rodando na porta ${config.port}`);
    });
};

startServer();