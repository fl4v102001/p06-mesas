// -----------------------------------------------------------------------------
// Arquivo: src/models/user.model.ts (MODIFICADO)
// -----------------------------------------------------------------------------
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    nomeCompleto: string;
    idCasa: string;
    email: string;
    senha: string;
    perfil: 'admin' | 'user'; // <-- NOVO
    creditos: number;
    creditos_especiais: number; // <-- NOVO
}

const UserSchema: Schema = new Schema({
    nomeCompleto: { type: String, required: true },
    idCasa: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    perfil: { type: String, enum: ['admin', 'user'], default: 'user' }, // <-- NOVO
    // Campos de crédito
    creditos: { type: Number, default: 2 },
    creditos_especiais: { type: Number, default: 0 }, // <-- NOVO
});

export const User = mongoose.model<IUser>('User', UserSchema);

