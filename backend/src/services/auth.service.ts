import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { SeatEntity } from '../models/postgres/Seat.entity';
import { CreditEntity } from '../models/postgres/Credit.entity';
import { config } from '../config';


export const loginUserService = async (idCasa: string) => {
    const creditRepository = AppDataSource.getRepository(CreditEntity);
    
    const credit = await creditRepository.findOne({ where: { codigoLote: idCasa } });
    
    if (!credit) {
        // Se o ID-Casa não existir, retorna um token com acesso somente leitura
        const token = jwt.sign({ userId: 'guest', idCasa, isReadOnly: true }, config.jwtSecret, { expiresIn: '1d' });
        return { 
            token, 
            user: { codigoLote: idCasa, qtyCredits: 0, mustPay: 0, isReadOnly: true } 
        };
    }
    
    // Todos os outros campos do user.model.ts (incluindo senha) foram descartados.
    // Então, consideramos apenas o idCasa (codigoLote) para o token.
    const token = jwt.sign({ userId: credit.id, idCasa: credit.codigoLote, isReadOnly: false }, config.jwtSecret, { expiresIn: '1d' });
    return { token, user: { ...credit, isReadOnly: false } };
};


/**
 * Libera as mesas selecionadas por um usuário durante o logout.
 * Executa uma transação para garantir a consistência dos dados.
 * @param userId O ID do usuário que está a fazer logout.
 * @param idCasa O ID-Casa do usuário, usado para encontrar as mesas.
 */
export const releaseUserTablesOnLogout = async (userId: string, idCasa: string) => {
    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        try {
            // 1. Encontrar todas as mesas selecionadas pelo usuário usando o codigoLote (idCasa)
            const selectedSeats = await transactionalEntityManager.find(SeatEntity, {
                where: { ownerId: idCasa, status: 'selecionada' }
            });

            if (selectedSeats.length > 0) {
                // 2. Calcular os créditos a serem devolvidos
                const creditsToReturn = selectedSeats.reduce((acc, seat) => {
                    if (seat.tipo === 'mesa-4') return acc + 1;
                    if (seat.tipo === 'mesa-6') return acc + 1;
                    return acc;
                }, 0);

                // 3. Atualizar o documento de créditos com os créditos devolvidos
                if (creditsToReturn > 0) {
                    const credit = await transactionalEntityManager.findOne(CreditEntity, { where: { codigoLote: idCasa } });
                    if (credit) {
                        credit.qtyCredits += creditsToReturn;
                        await transactionalEntityManager.save(credit);
                    }
                }

                // 4. Atualizar as mesas para o estado 'livre'
                for (const seat of selectedSeats) {
                    seat.status = 'livre';
//                    seat.tipo = 'mesa-4';
                    seat.ownerId = null;
                }
                await transactionalEntityManager.save(selectedSeats);
            }

            console.log(`Transação de logout para o usuário ${idCasa} concluída com sucesso.`);

        } catch (error) {
            console.error(`Erro na transação de logout para o usuário ${idCasa}:`, error);
            throw new Error('Falha ao processar o logout e liberar as mesas.');
        }
    });
};
