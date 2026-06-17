// -----------------------------------------------------------------------------
// Arquivo: src/services/table.service.ts (MODIFICADO)
// -----------------------------------------------------------------------------
import { AppDataSource } from '../config/data-source';
import { SeatEntity } from '../models/postgres/Seat.entity';
import { CreditEntity } from '../models/postgres/Credit.entity';
import { EventEntity } from '../models/postgres/Event.entity';

/**
 * Nomeia todas as mesas que ainda não têm um nome.
 * O nome é gerado no formato "COLUNA-LINHA" (ex: "A-01", "C-04").
 */
export const nameEmptyTables = async () => {
    try {
        const seatRepository = AppDataSource.getRepository(SeatEntity);
        const unnamedSeats = await seatRepository.find({ where: { nome: '' } });

        if (unnamedSeats.length === 0) {
            console.log("Nenhuma mesa sem nome para atualizar.");
            return;
        }

        const seatsToUpdate = unnamedSeats.map(seat => {
            // Converte o índice da coluna para uma letra (0 -> A, 1 -> B, ...)
            const columnName = String.fromCharCode(65 + seat.coluna);
            // Formata o número da linha para ter sempre dois dígitos (1 -> 01, 10 -> 10)
            const rowName = String(seat.linha + 1).padStart(2, '0');
            const newName = `${columnName}-${rowName}`;

            seat.nome = newName;
            return seat;
        });

        await seatRepository.save(seatsToUpdate);
        console.log(`${seatsToUpdate.length} mesas nomeadas com sucesso.`);

    } catch (error) {
        console.error("Erro ao nomear as mesas:", error);
    }
};

export const initializeTables = async (event: EventEntity) => {
    try {
        const seatRepository = AppDataSource.getRepository(SeatEntity);
        const count = await seatRepository.count();
        if (count === 0) {
            console.log('Banco de dados de mesas vazio. Inicializando mesas...');
            const seatsToCreate = [];
            const placeholderSet = new Set(
                event.placeholders.map(p => `${p.linha},${p.coluna}`)
            );

            for (let i = 0; i < event.mapRows; i++) {
                for (let j = 0; j < event.mapCols; j++) {
                    if (!placeholderSet.has(`${i},${j}`)) {
                        const seat = seatRepository.create({
                            linha: i,
                            coluna: j,
                            nome: '',
                            idEvent: parseInt(event.id, 10) || 1, // Need to make sure this is handled correctly
                            status: 'livre',
                            tipo: 'mesa-4',
                            price: event.priceS || 50
                        });
                        seatsToCreate.push(seat);
                    }
                }
            }
            await seatRepository.save(seatsToCreate);
            console.log(`${seatsToCreate.length} mesas criadas com sucesso.`);
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
    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        const credit = await transactionalEntityManager.findOne(CreditEntity, { where: { codigoLote: user_idCasa } });
        const seat = await transactionalEntityManager.findOne(SeatEntity, { where: { linha, coluna } });

        if (!credit || !seat) {
            throw new Error("Usuário (Crédito) ou mesa não encontrados.");
        }

        // Cenário 1: Clicar em uma mesa "livre"
        if (seat.status === 'livre') {
            // Prioridade 1: Usar crédito especial (mustPay) para comprar diretamente
            if (credit.mustPay >= 1) {
                seat.status = 'comprada';
                seat.tipo = 'S';
                seat.ownerId = credit.codigoLote;
                credit.mustPay -= 1;
            }
            // Prioridade 2: Usar crédito normal para selecionar
            else if (credit.qtyCredits >= 1) {
                seat.status = 'selecionada';
                seat.tipo = 'S';
                seat.ownerId = credit.codigoLote;
                credit.qtyCredits -= 1;
            }
            // Se não tiver nenhum crédito, nada acontece
        }
        // Cenário 2: Clicar em uma mesa "selecionada" pelo próprio usuário
        else if (seat.status === 'selecionada' && seat.ownerId === credit.codigoLote) {
            seat.status = 'livre';
            seat.tipo = 'mesa-4';
            seat.ownerId = null;
            credit.qtyCredits += 1; // Devolve 1 crédito normal
        }
        // Cenário 3: Clicar em uma mesa "comprada" pelo próprio usuário
        else if (seat.status === 'comprada' && seat.ownerId === credit.codigoLote) {
            seat.status = 'livre';
            seat.tipo = 'mesa-4';
            seat.ownerId = null;
            credit.mustPay += 1; // Devolve 1 crédito especial
        }

        // Salva as alterações no banco de dados
        await transactionalEntityManager.save(credit);
        await transactionalEntityManager.save(seat);
    });
};

/**
 * Finaliza a compra das mesas selecionadas por um usuário.
 * @param userId O ID (_id) do usuário.
 * @param idCasa O ID-Casa do usuário.
 */
export const purchaseSelectedTables = async (userId: string, idCasa: string) => {
    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        try {
            // 1. Encontrar as mesas selecionadas e o crédito associado
            const selectedSeats = await transactionalEntityManager.find(SeatEntity, {
                where: { ownerId: idCasa, status: 'selecionada' }
            });

            if (selectedSeats.length === 0) {
                throw new Error("Nenhuma mesa selecionada para comprar.");
            }

            const credit = await transactionalEntityManager.findOne(CreditEntity, { where: { codigoLote: idCasa } });
            if (!credit) {
                throw new Error("Crédito não encontrado.");
            }

            // 4. Atualizar as mesas para o estado 'comprada'
            for (const seat of selectedSeats) {
                seat.status = 'comprada';
            }
            
            await transactionalEntityManager.save(selectedSeats);
            console.log(`Compra de ${selectedSeats.length} mesas para ${idCasa} concluída.`);

        } catch (error) {
            console.error(`Erro na transação de compra para ${idCasa}:`, error);
            throw error; // Re-lança o erro para o controlador lidar com ele
        }
    });
};
