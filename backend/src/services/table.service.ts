
// -----------------------------------------------------------------------------
// Arquivo: src/services/table.service.ts (MODIFICADO)
// -----------------------------------------------------------------------------
import mongoose from 'mongoose';
import { Table } from '../models/table.model';
import { User } from '../models/user.model';
import { ISettings } from '../models/settings.models'; // <-- CORREÇÃO: Importar do caminho correto
import { appConfig } from '../config/appConfig';

/**
 * Nomeia todas as mesas que ainda não têm um nome.
 * O nome é gerado no formato "COLUNA-LINHA" (ex: "A-01", "C-04").
 */
export const nameEmptyTables = async () => {
    try {
        const unnamedTables = await Table.find({ nome: '' });

        if (unnamedTables.length === 0) {
            console.log("Nenhuma mesa sem nome para atualizar.");
            return;
        }

        const bulkOps = unnamedTables.map(table => {
            // Converte o índice da coluna para uma letra (0 -> A, 1 -> B, ...)
            const columnName = String.fromCharCode(65 + table.coluna);
            // Formata o número da linha para ter sempre dois dígitos (1 -> 01, 10 -> 10)
            const rowName = String(table.linha + 1).padStart(2, '0');
            const newName = `${columnName}-${rowName}`;

            return {
                updateOne: {
                    filter: { _id: table._id },
                    update: { $set: { nome: newName } }
                }
            };
        });

        const result = await Table.bulkWrite(bulkOps);
        console.log(`${result.modifiedCount} mesas nomeadas com sucesso.`);

    } catch (error) {
        console.error("Erro ao nomear as mesas:", error);
    }
};

export const initializeTables = async (settings: ISettings) => {
    try {
        const count = await Table.countDocuments();
        if (count === 0) {
            console.log('Banco de dados de mesas vazio. Inicializando mesas...');
            const tablesToCreate = [];
            const placeholderSet = new Set(
                settings.placeholders.map(p => `${p.linha},${p.coluna}`)
            );

            for (let i = 0; i < settings.mapRows; i++) {
                for (let j = 0; j < settings.mapCols; j++) {
                    if (!placeholderSet.has(`${i},${j}`)) {
                        tablesToCreate.push({ linha: i, coluna: j });
                    }
                }
            }
            await Table.insertMany(tablesToCreate);
            console.log(`${tablesToCreate.length} mesas criadas com sucesso.`);
        } else {
            console.log('Mesas já existem no banco de dados.');
        }
    } catch (error) {
        console.error('Erro ao inicializar mesas:', error);
    }
};


/**
 * Lida com a lógica de clique em uma mesa, aplicando as novas regras de negócio.
 */
export const handleTableClickService = async (user_idCasa: string, linha: number, coluna: number) => {
    const user = await User.findOne({ idCasa: user_idCasa });
    const table = await Table.findOne({ linha, coluna });

    if (!user || !table) {
        throw new Error("Usuário ou mesa não encontrados.");
    }

    // Cenário 1: Clicar em uma mesa "livre"
    if (table.status === 'livre') {
        // Prioridade 1: Usar crédito especial para comprar diretamente
        if (user.creditos_especiais >= 1) {
            table.status = 'comprada';
            table.tipo = 'S';
            table.ownerId = user.idCasa;
            user.creditos_especiais -= 1;
        }
        // Prioridade 2: Usar crédito normal para selecionar
        else if (user.creditos >= 1) {
            table.status = 'selecionada';
            table.tipo = 'S';
            table.ownerId = user.idCasa;
            user.creditos -= 1;
        }
        // Se não tiver nenhum crédito, nada acontece
    }
    // Cenário 2: Clicar em uma mesa "selecionada" pelo próprio usuário
    else if (table.status === 'selecionada' && table.ownerId === user.idCasa) {
        table.status = 'livre';
        table.tipo = null;
        table.ownerId = null;
        user.creditos += 1; // Devolve 1 crédito normal
    }
    // Cenário 3: Clicar em uma mesa "comprada" pelo próprio usuário
    else if (table.status === 'comprada' && table.ownerId === user.idCasa) {
        table.status = 'livre';
        table.tipo = null;
        table.ownerId = null;
        user.creditos_especiais += 1; // Devolve 1 crédito especial
    }

    // Salva as alterações no banco de dados
    await user.save();
    await table.save();
};

/**
 * Finaliza a compra das mesas selecionadas por um usuário.
 * @param userId O ID (_id) do usuário.
 * @param idCasa O ID-Casa do usuário.
 */
export const purchaseSelectedTables = async (userId: string, idCasa: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Encontrar as mesas selecionadas e o usuário
        const selectedTables = await Table.find({
            ownerId: idCasa,
            status: 'selecionada'
        }).session(session);

        if (selectedTables.length === 0) {
            throw new Error("Nenhuma mesa selecionada para comprar.");
        }

        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error("Usuário não encontrado.");
        }

        // 2. Calcular o custo em créditos normais e verificar se há saldo suficiente
//        const creditsCost = selectedTables.length;
//        if (user.creditos < creditsCost) {
//            throw new Error("Créditos insuficientes para realizar a compra.");
//        }

        // 3. O ganho em créditos especiais é igual ao número de mesas compradas
//        const specialCreditsToGain = selectedTables.length;

        // 4. Atualizar as mesas para o estado 'comprada'
        const tableIdsToPurchase = selectedTables.map(t => t._id);
        await Table.updateMany(
            { _id: { $in: tableIdsToPurchase } },
            { $set: { status: 'comprada' } },
            { session }
        );

        // 5. Atualizar o usuário, subtraindo os créditos normais e adicionando os especiais
//        await User.findByIdAndUpdate(
//            userId,
//            { 
//                $inc: { 
//                    creditos: -creditsCost,
//                    creditos_especiais: specialCreditsToGain 
//                } 
//            },
//            { session }
//        );

        // Se tudo correu bem, comita a transação
        await session.commitTransaction();
        console.log(`Compra de ${selectedTables.length} mesas para ${idCasa} concluída.`);

    } catch (error) {
        // Se algo deu errado, aborta a transação
        await session.abortTransaction();
        console.error(`Erro na transação de compra para ${idCasa}:`, error);
        throw error; // Re-lança o erro para o controlador lidar com ele
    } finally {
        session.endSession();
    }
};
