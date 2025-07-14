
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
import { Settings } from './models/settings.models'; // <-- CORREÇÃO: Importar do caminho correto

// Importações de Rotas
import authRoutes from './routes/auth.routes';
import settingsRoutes from './routes/settings.routes';
import tableRoutes from './routes/table.routes';

// Importações de Serviços e Controladores
import { initializeTables, nameEmptyTables } from './services/table.service'; // <-- NOVO
import { WebSocketService } from './services/websocket.service';
import { handleConnection } from './controllers/websocket.controller';

dotenv.config();

const startServer = async () => {
    // Conectar ao Banco de Dados
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/table-reservation');

    // Procura pela configuração ATIVA
    let activeSettings = await Settings.findOne({ status: 'ativo' });

    if (!activeSettings) {
        const anySettings = await Settings.findOne();
        if (!anySettings) {
            console.log("Nenhum documento de configuração encontrado. Criando um novo com status 'ativo'...");
            activeSettings = new Settings();
            await activeSettings.save();
            console.log("Documento de configuração padrão criado.");
        } else {
            console.error("ERRO CRÍTICO: Existem configurações no banco de dados, mas nenhuma está marcada como 'ativa'.");
            console.error("Por favor, defina uma configuração como 'ativa' no banco de dados para iniciar o servidor.");
            process.exit(1);
        }
    } else {
        console.log(`Configuração ativa para o evento "${activeSettings.eventName}" carregada da base de dados.`);
    }
    
    setAppConfig(activeSettings);

    // Inicializa as mesas usando as configurações carregadas
    await initializeTables(activeSettings);

    // Garante que todas as mesas tenham um nome
    await nameEmptyTables(); // <-- NOVO

    // Configuração do Servidor Express
    const app = express();
    app.use(cors());
    app.use(express.json());

    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });
    const wsService = new WebSocketService(wss);

    app.use((req: any, res, next) => {
        req.wsService = wsService;
        next();
    });

    // Rotas da API
    app.use('/api/auth', authRoutes);
    app.use('/api/config', settingsRoutes);
    app.use('/api/tables', tableRoutes);

    wss.on('connection', (ws, req) => {
        handleConnection(ws, req, wsService);
    });

    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
        console.log(`Servidor HTTP e WebSocket rodando na porta ${PORT}`);
    });
};

startServer();
