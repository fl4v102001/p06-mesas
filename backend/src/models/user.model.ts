import mongoose from 'mongoose';

// Interface para o documento do Usuário
export interface IUser extends mongoose.Document {
    nomeCompleto: string;
    idCasa: string;
    email: string;
    senha: string;
    creditos: number;
    creditos_especiais: number;
}

// Schema do Usuário
const UserSchema = new mongoose.Schema<IUser>({
    nomeCompleto: { type: String, required: true },
    idCasa: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    creditos: { type: Number, default: 2 },
    creditos_especiais: { type: Number, default: 0 }
});

export const User = mongoose.model<IUser>('User', UserSchema);