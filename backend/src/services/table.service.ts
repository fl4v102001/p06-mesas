import { Table } from '../models/table.model';
import { User } from '../models/user.model';

const NUM_LINHAS = 19;
const NUM_COLUNAS = 9;

// Inicializa o mapa de mesas se estiver vazio
export const initializeTables = async () => {
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
        }
    } catch (error) {
        console.error('Erro ao inicializar mesas:', error);
    }
};

// Lógica de negócio para o clique em uma mesa
export const handleTableClickService = async (user_idCasa: string, linha: number, coluna: number) => {
    const user = await User.findOne({ idCasa: user_idCasa });
    const table = await Table.findOne({ linha, coluna });

    if (!user || !table) {
        throw new Error("Usuário ou mesa não encontrados.");
    }

    // Clique em mesa livre (BRANCA)
    if (table.status === 'livre') {
        if (user.creditos_especiais >= 1) {
            table.status = 'comprada';
            table.tipo = 'S'; // Mesa "D" (AZUL ESCURO)
            table.ownerId = user.idCasa;
            user.creditos_especiais -= 1; // Gasta 1 crédito especial
        } else if (user.creditos >= 1) {
            table.status = 'selecionada';
            table.tipo = 'S';
            table.ownerId = user.idCasa;
            user.creditos -= 1;
        }
    }
    // Clique em mesa selecionada pelo próprio usuário
    else if (table.status === 'selecionada' && table.ownerId === user.idCasa) {
        if (table.tipo === 'S') { // Clicar em mesa "S" (AZUL CLARO) -> Liberar
            table.status = 'livre';
            table.tipo = null;
            table.ownerId = null;
            user.creditos += 1;
        } else if (table.tipo === 'D') { // Clicar em mesa "D" (AZUL ESCURO) -> Liberar
            table.status = 'livre';
            table.tipo = null;
            table.ownerId = null;
            user.creditos += 2;
        }
    }
    // Clique em mesa comprada pelo próprio usuário (VERDE)
    else if (table.status === 'comprada' && table.ownerId === user.idCasa) {
        table.status = 'livre'; // Torna-se selecionada novamente
        table.tipo = null; // Remove o tipo
        table.ownerId = null; // Remove o dono
        user.creditos_especiais += 1; // Retorna 1 crédito
    }

    await user.save();
    await table.save();
};