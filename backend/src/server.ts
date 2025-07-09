/*
 * =============================================================================
 * ARQUIVO PRINCIPAL DO BACKEND - Sistema de Reserva de Mesas
 * =============================================================================
 * Stack: Node.js, Express, TypeScript, MongoDB, WebSocket (ws)
 *
 * Para executar este projeto:
 * 1. Instale as dependências:
 * npm install express mongoose ws jsonwebtoken bcryptjs dotenv cors
 * npm install --save-dev @types/express @types/ws @types/bcryptjs @types/jsonwebtoken @types/cors ts-node-dev typescript
 *
 * 2. Crie um arquivo .env na raiz do projeto com o seguinte conteúdo:
 * PORT=8080
 * MONGODB_URI=mongodb://localhost:27017/table-reservation
 * JWT_SECRET=seu_segredo_super_secreto_aqui
 *
 * 3. Crie um arquivo tsconfig.json:
 * {
 * "compilerOptions": {
 * "target": "es6",
 * "module": "commonjs",
 * "outDir": "./dist",
 * "rootDir": "./src",
 * "strict": true,
 * "esModuleInterop": true,
 * "skipLibCheck": true
 * }
 * }
 *
 * 4. Coloque este código em um arquivo `src/server.ts`.
 *
 * 5. Execute o servidor em modo de desenvolvimento:
 * npx ts-node-dev --respawn --transpile-only src/server.ts
 *
 * =============================================================================
 */

import express, { Request, Response } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// --- CONFIGURAÇÃO INICIAL ---
const app = express();
app.use(cors()); // Permite requisições de origens diferentes (ex: seu frontend React)
app.use(express.json()); // Permite que o express entenda JSON no corpo das requisições

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/table-reservation';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// --- DEFINIÇÃO DOS MODELOS (SCHEMAS) DO MONGODB ---

// Interface para o documento do Usuário
interface IUser extends mongoose.Document {
    nomeCompleto: string;
    idCasa: string;
    email: string;
    senha: string;
    creditos: number;
}

// Schema do Usuário
const UserSchema = new mongoose.Schema<IUser>({
    nomeCompleto: { type: String, required: true },
    idCasa: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    creditos: { type: Number, default: 2 },
});

const User = mongoose.model<IUser>('User', UserSchema);

// Interface para o documento da Mesa
interface ITable extends mongoose.Document {
    linha: number;
    coluna: number;
    status: 'livre' | 'selecionada' | 'comprada';
    tipo: 'S' | 'D' | null;
    ownerId: string | null; // Armazena o idCasa do dono
}

// Schema da Mesa
const TableSchema = new mongoose.Schema<ITable>({
    linha: { type: Number, required: true },
    coluna: { type: Number, required: true },
    status: { type: String, enum: ['livre', 'selecionada', 'comprada'], default: 'livre' },
    tipo: { type: String, enum: ['S', 'D', null], default: null },
    ownerId: { type: String, default: null },
}, {
    // Cria um índice composto para garantir que cada posição (linha, coluna) seja única
    indexes: [{ unique: true, fields: ['linha', 'coluna'] }]
});

const Table = mongoose.model<ITable>('Table', TableSchema);


// --- FUNÇÃO DE INICIALIZAÇÃO DO MAPA DE MESAS ---
const NUM_LINHAS = 19;
const NUM_COLUNAS = 19;

const initializeTables = async () => {
    try {
        const count = await Table.countDocuments();
        if (count === 0) {
            console.log('Banco de dados de mesas vazio. Inicializando mesas...');
            const tablesToCreate = [];
            for (let i = 0; i < NUM_LINHAS; i++) {
                for (let j = 0; j < NUM_COLUNAS; j++) {
                    tablesToCreate.push({ linha: i, coluna: j });
                }
            }
            await Table.insertMany(tablesToCreate);
            console.log(`${NUM_LINHAS * NUM_COLUNAS} mesas criadas com sucesso.`);
        } else {
            console.log('Mesas já existem no banco de dados.');
        }
    } catch (error) {
        console.error('Erro ao inicializar mesas:', error);
    }
};

// --- LÓGICA DE AUTENTICAÇÃO (API REST) ---

// Rota de Registro
app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        const { nomeCompleto, idCasa, email, senha } = req.body;

        if (!nomeCompleto || !idCasa || !email || !senha) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { idCasa }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email ou ID-Casa já existem.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const newUser = new User({
            nomeCompleto,
            idCasa,
            email,
            senha: hashedPassword,
            creditos: 2 // Usuários começam com 2 créditos
        });

        await newUser.save();

        res.status(201).json({ message: 'Usuário registrado com sucesso.' });

    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error });
    }
});

// Rota de Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { idCasa, senha } = req.body;
        const user = await User.findOne({ idCasa });

        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        const isMatch = await bcrypt.compare(senha, user.senha);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ userId: user._id, idCasa: user.idCasa }, JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, idCasa: user.idCasa, creditos: user.creditos });

    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error });
    }
});


// --- LÓGICA DO WEBSOCKET ---

// Armazena as conexões ativas, associando o idCasa ao objeto WebSocket
const activeConnections: Map<string, WebSocket> = new Map();

// Função para enviar o estado atualizado do mapa para todos os clientes
const broadcastMapUpdate = async () => {
    try {
        const tables = await Table.find({});
        const users = await User.find({}, 'idCasa creditos'); // Pega apenas idCasa e creditos

        const usersCreditsMap = users.reduce((acc, user) => {
            acc[user.idCasa] = user.creditos;
            return acc;
        }, {} as Record<string, number>);

        const message = JSON.stringify({
            type: 'map-update',
            payload: {
                tables,
                usersCredits: usersCreditsMap,
            }
        });

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    } catch (error) {
        console.error("Erro ao transmitir atualização do mapa:", error);
    }
};

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    console.log('Novo cliente conectado via WebSocket.');

    // Autenticação da conexão WebSocket
    const token = req.url?.split('token=')[1];
    if (!token) {
        console.log('Conexão WebSocket sem token. Fechando.');
        ws.close();
        return;
    }

    let decoded: any;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
        const idCasa = decoded.idCasa;
        activeConnections.set(idCasa, ws);
        console.log(`Cliente ${idCasa} autenticado e conectado.`);
    } catch (error) {
        console.log('Token WebSocket inválido. Fechando conexão.');
        ws.close();
        return;
    }

    // Envia o estado inicial do mapa para o cliente recém-conectado
    broadcastMapUpdate();

    ws.on('message', async (message: string) => {
        try {
            const data = JSON.parse(message);
            const user_idCasa = decoded.idCasa;

            if (data.type === 'cliqueMesa') {
                const { linha, coluna } = data.payload;

                const user = await User.findOne({ idCasa: user_idCasa });
                const table = await Table.findOne({ linha, coluna });

                if (!user || !table) {
                    return; // Usuário ou mesa não encontrados
                }

                // --- LÓGICA DE NEGÓCIO PRINCIPAL ---

                // Clique em mesa livre (BRANCA)
                if (table.status === 'livre') {
                    if (user.creditos >= 1) {
                        table.status = 'selecionada';
                        table.tipo = 'S';
                        table.ownerId = user.idCasa;
                        user.creditos -= 1;
                    }
                    // Se não tem crédito, nada acontece
                }
                // Clique em mesa selecionada pelo próprio usuário
                else if (table.status === 'selecionada' && table.ownerId === user.idCasa) {
                    // Clicar em mesa "S" (AZUL CLARO)
                    if (table.tipo === 'S') {
                        if (user.creditos >= 1) { // Transformar em dupla "D"
                            table.tipo = 'D';
                            user.creditos -= 1;
                        } else { // Liberar a mesa
                            table.status = 'livre';
                            table.tipo = null;
                            table.ownerId = null;
                            user.creditos += 1;
                        }
                    }
                    // Clicar em mesa "D" (AZUL ESCURO)
                    else if (table.tipo === 'D') {
                        table.status = 'livre';
                        table.tipo = null;
                        table.ownerId = null;
                        user.creditos += 2;
                    }
                }
                // Clique em mesa comprada pelo próprio usuário (VERDE)
                else if (table.status === 'comprada' && table.ownerId === user.idCasa) {
                    table.status = 'selecionada'; // Torna-se selecionada novamente
                    // Créditos não são alterados nesta ação
                }

                // Salva as alterações no banco de dados
                await user.save();
                await table.save();

                // Transmite a atualização para todos
                await broadcastMapUpdate();
            }
        } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error);
        }
    });

    ws.on('close', () => {
        const idCasa = decoded.idCasa;
        activeConnections.delete(idCasa);
        console.log(`Cliente ${idCasa} desconectado.`);
    });
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
const startServer = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Conectado ao MongoDB com sucesso.');

        await initializeTables();

        server.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Servidor WebSocket escutando na mesma porta.`);
        });
    } catch (error) {
        console.error('Falha ao conectar ao MongoDB ou iniciar o servidor:', error);
        process.exit(1);
    }
};

startServer();
