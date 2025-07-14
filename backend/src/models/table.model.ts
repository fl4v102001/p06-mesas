// -----------------------------------------------------------------------------
// Arquivo: src/models/table.model.ts (MODIFICADO)
// -----------------------------------------------------------------------------
import mongoose, { Schema, Document } from 'mongoose';

// Interface para o documento da Mesa
export interface ITable extends Document {
    linha: number;
    coluna: number;
    status: 'livre' | 'selecionada' | 'comprada';
    tipo: 'S' | 'D' | null;
    ownerId: string | null;
    nome: string; // <-- NOVO
}

// Schema da Mesa
const TableSchema: Schema = new Schema<ITable>({
    linha: { type: Number, required: true },
    coluna: { type: Number, required: true },
    status: { type: String, enum: ['livre', 'selecionada', 'comprada'], default: 'livre' },
    tipo: { type: String, enum: ['S', 'D', null], default: null },
    ownerId: { type: String, default: null },
    nome: { type: String, default: '' }, // <-- NOVO
});

TableSchema.index({ linha: 1, coluna: 1 }, { unique: true });

export const Table = mongoose.model<ITable>('Table', TableSchema);

