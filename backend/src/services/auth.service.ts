import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/user.model';
import { config } from '../config';

// DTO (Data Transfer Object) para o registro de usuário.
// Define a estrutura de dados esperada, tornando o código mais claro.
export interface RegisterUserDto {
    nomeCompleto: string;
    idCasa: string;
    email: string;
    senha: string;
}

// Serviço para registrar um novo usuário
export const registerUserService = async (userData: RegisterUserDto) => {
    const { nomeCompleto, idCasa, email, senha } = userData;

    const existingUser = await User.findOne({ $or: [{ email }, { idCasa }] });
    if (existingUser) {
        throw new Error('Email ou ID-Casa já existem.');
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = new User({
        nomeCompleto,
        idCasa,
        email,
        senha: hashedPassword,
        creditos: 2,
        creditos_especiais: 0,
    });

    await newUser.save();
    return newUser;
};

// Serviço para autenticar um usuário e retornar um token
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
