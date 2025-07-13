// -----------------------------------------------------------------------------
// Arquivo: src/types/index.ts (MODIFICADO)
// -----------------------------------------------------------------------------
export interface TableData {
    _id: string;
    linha: number;
    coluna: number;
    status: 'livre' | 'selecionada' | 'comprada';
    tipo: 'S' | 'D' | null;
    ownerId: string | null;
}

export interface UserCreditsData {
    creditos: number;
    creditos_especiais: number;
}

export interface MapUpdatePayload {
    tables: TableData[];
    usersCredits: Record<string, UserCreditsData>;
}

// Nova interface para as Configurações
export interface ISettings {
    eventName: string;
    mapRows: number;
    mapCols: number;
    priceS: number;
    priceD: number;
    placeholders: { linha: number; coluna: number }[];
    baseWidth: number;
    baseHeight: number;
    scaleIncrement: number;
    svgScale: number;
    maxOffsetX: number;
    maxOffsetY: number;
}

export interface AuthContextType {
    token: string | null;
    idCasa: string | null;
    login: (token: string, idCasa: string) => void;
    logout: () => Promise<void>;
}

export interface WebSocketContextType {
    tables: TableData[];
    userCredits: number;
    sendMessage: (message: object) => void;
    isConnected: boolean;
}

export interface SettingsContextType {
    settings: ISettings | null;
    isLoading: boolean;
}

export interface RegisterFormData {
    nomeCompleto: string;
    idCasa: string;
    email: string;
    senha: string;
}
