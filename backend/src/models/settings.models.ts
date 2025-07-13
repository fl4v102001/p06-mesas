// -----------------------------------------------------------------------------
// Arquivo: src/models/settings.model.ts (NOVO)
// -----------------------------------------------------------------------------
import mongoose, { Schema, Document } from 'mongoose';

// Interface para o subdocumento de Placeholder
interface IPlaceholder {
    linha: number;
    coluna: number;
}

// Interface para o documento de Configurações
export interface ISettings extends Document {
    eventName: string;
    mapRows: number;
    mapCols: number;
    priceS: number;
    priceD: number;
    placeholders: IPlaceholder[];
    baseWidth: number;
    baseHeight: number;
    scaleIncrement: number;
    svgScale: number;
    maxOffsetX: number;
    maxOffsetY: number;
}

const PlaceholderSchema: Schema = new Schema({
    linha: { type: Number, required: true },
    coluna: { type: Number, required: true }
}, { _id: false });

const SettingsSchema: Schema = new Schema({
    eventName: { type: String, required: true, default: "Evento A" },
    mapRows: { type: Number, required: true, min: 1, default: 20 },
    mapCols: { type: Number, required: true, min: 1, default: 9 },
    priceS: { type: Number, required: true, min: 0, default: 50.0 },
    priceD: { type: Number, required: true, min: 0, default: 100.0 },
    placeholders: {
        type: [PlaceholderSchema],
        default: [
            { linha: 0, coluna: 3 }, { linha: 0, coluna: 4 }, { linha: 0, coluna: 5 },
            { linha: 1, coluna: 3 }, { linha: 1, coluna: 4 }, { linha: 1, coluna: 5 }
        ]
    },
    baseWidth: { type: Number, required: true, default: 55 },
    baseHeight: { type: Number, required: true, default: 60 },
    scaleIncrement: { type: Number, required: true, default: 0.03 },
    svgScale: { type: Number, required: true, default: 0.9 },
    maxOffsetX: { type: Number, required: true, default: 10 },
    maxOffsetY: { type: Number, required: true, default: 10 },
});

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
