import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, IUser } from '../models/user.model';
import { Table } from '../models/table.model';
import { config } from '../config';

// ... (as funções registerUserService e loginUserService permanecem as mesmas)

export interface RegisterUserDto {
    nomeCompleto: string;
    idCasa: string;
    email: string;
    senha: string;
}

export const registerUserService = async (userData: RegisterUserDto) => {
    const { nomeCompleto, idCasa, email, senha } = userData;
    const existingUser = await User.findOne({ $or: [{ email }, { idCasa }] });
    if (existingUser) {
        throw new Error('Email ou ID-Casa já existem.');
    }
    const hashedPassword = await bcrypt.hash(senha, 10);
    const newUser = new User({ nomeCompleto, idCasa, email, senha: hashedPassword, creditos: 2, perfil: 'user', creditos_especiais: 0 });
    await newUser.save();
    return newUser;
};

export const loginUserService = async (idCasa: string, senha: string): Promise<{ token: string; user: IUser }> => {
    const user = await User.findOne({ idCasa });
    if (!user) {
        throw new Error('Credenciais inválidas.');
    }
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
        throw new Error('Credenciais inválidas.');
    }
    const token = jwt.sign({ userId: user._id, idCasa: user.idCasa }, config.jwtSecret, { expiresIn: '1d' });
    return { token, user };
};


/**
 * Libera as mesas selecionadas por um usuário durante o logout.
 * Executa uma transação para garantir a consistência dos dados.
 * @param userId O ID (_id) do usuário que está a fazer logout.
 * @param idCasa O ID-Casa do usuário, usado para encontrar as mesas.
 */
export const releaseUserTablesOnLogout = async (userId: string, idCasa: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Encontrar todas as mesas selecionadas pelo usuário usando o idCasa
        const selectedTables = await Table.find({
            ownerId: idCasa, // <-- CORREÇÃO: Usar idCasa para encontrar as mesas
            status: 'selecionada'
        }).session(session);

        if (selectedTables.length > 0) {
            // 2. Calcular os créditos a serem devolvidos
            const creditsToReturn = selectedTables.reduce((acc, table) => {
                if (table.tipo === 'S') return acc + 1;
                if (table.tipo === 'D') return acc + 2;
                return acc;
            }, 0);

            // 3. Atualizar o documento do usuário com os créditos devolvidos usando o _id
            if (creditsToReturn > 0) {
                await User.findByIdAndUpdate(
                    userId, // <-- CORRETO: Usar o _id para atualizar o usuário
                    { $inc: { creditos: creditsToReturn } },
                    { session }
                );
            }

            // 4. Atualizar as mesas para o estado 'livre'
            const tableIdsToRelease = selectedTables.map(t => t._id);
            await Table.updateMany(
                { _id: { $in: tableIdsToRelease } },
                { $set: { status: 'livre', tipo: null, ownerId: null } },
                { session }
            );
        }

        await session.commitTransaction();
        console.log(`Transação de logout para o usuário ${idCasa} concluída com sucesso.`);

    } catch (error) {
        await session.abortTransaction();
        console.error(`Erro na transação de logout para o usuário ${idCasa}:`, error);
        throw new Error('Falha ao processar o logout e liberar as mesas.');
    } finally {
        session.endSession();
    }
};
