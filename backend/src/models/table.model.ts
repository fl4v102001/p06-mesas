import mongoose from 'mongoose';

// Interface para o documento da Mesa
export interface ITable extends mongoose.Document {
    linha: number;
    coluna: number;
    status: 'livre' | 'selecionada' | 'comprada';
    tipo: 'S' | 'D' | null;
    ownerId: string | null;
}

// Schema da Mesa
const TableSchema = new mongoose.Schema<ITable>({
    linha: { type: Number, required: true },
    coluna: { type: Number, required: true },
    status: { type: String, enum: ['livre', 'selecionada', 'comprada'], default: 'livre' },
    tipo: { type: String, enum: ['S', 'D', null], default: null },
    ownerId: { type: String, default: null },
}, {
    // Cria um índice composto para garantir que cada posição (linha, coluna) seja única
    indexes: [{ unique: true, fields: ['linha', 'coluna'] }]
});

export const Table = mongoose.model<ITable>('Table', TableSchema);
