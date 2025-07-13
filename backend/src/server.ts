// -----------------------------------------------------------------------------
// Arquivo: src/server.ts (MODIFICADO)
// -----------------------------------------------------------------------------
import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

// Importações de Configuração e Modelos
import { connectDB } from './config/db';
import { setAppConfig } from './config/appConfig';
import { Settings } from './models/settings.models'; // <-- NOVO

// Importações de Rotas
import authRoutes from './routes/auth.routes';
import settingsRoutes from './routes/settings.routes';
import tableRoutes from './routes/table.routes'; // <-- NOVO

// Importações de Serviços e Controladores
import { initializeTables } from './services/table.service';
import { WebSocketService } from './services/websocket.service';
import { handleConnection } from './controllers/websocket.controller';

dotenv.config();

const startServer = async () => {
    // Conectar ao Banco de Dados
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/table-reservation');

    // Garantir que o documento de configuração Singleton exista e carregá-lo
    let settings = await Settings.findOne();
    if (!settings) {
        console.log("Nenhum documento de configuração encontrado. Criando um com valores padrão...");
        settings = new Settings();
        await settings.save();
        console.log("Documento de configuração criado.");
    } else {
        console.log("Documento de configuração carregado da base de dados.");
    }
    setAppConfig(settings);

    // Inicializa as mesas usando as configurações carregadas
    await initializeTables(settings);

    // Configuração do Servidor Express
    const app = express();
    app.use(cors());
    app.use(express.json());

    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });
    const wsService = new WebSocketService(wss);

    // Middleware para injetar o wsService em todas as requisições
    app.use((req: any, res, next) => {
        req.wsService = wsService;
        next();
    });

    // Rotas da API
    app.use('/api/auth', authRoutes);
    app.use('/api/config', settingsRoutes);
    app.use('/api/tables', tableRoutes); // <-- NOVO

    // Lida com novas conexões WebSocket
    wss.on('connection', (ws, req) => {
        handleConnection(ws, req, wsService);
    });

    // Inicia o servidor
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
        console.log(`Servidor HTTP e WebSocket rodando na porta ${PORT}`);
    });
};

startServer();
