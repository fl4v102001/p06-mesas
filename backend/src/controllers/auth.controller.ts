import { Request, Response } from 'express';



//import { registerUserService, loginUserService } from '../services/auth.service';
import { registerUserService, loginUserService } from '../services/auth.service';



export const register = async (req: Request, res: Response) => {
    try {
        const { nomeCompleto, idCasa, email, senha } = req.body;
        if (!nomeCompleto || !idCasa || !email || !senha) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        await registerUserService({ nomeCompleto, idCasa, email, senha });
        res.status(201).json({ message: 'Usuário registrado com sucesso.' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { idCasa, senha } = req.body;
        const { token, user } = await loginUserService(idCasa, senha);
        res.json({ token, idCasa: user.idCasa, creditos: user.creditos, creditos_especiais: user.creditos_especiais });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};