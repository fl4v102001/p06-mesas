// -----------------------------------------------------------------------------
// Arquivo: src/types/index.ts
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

export interface AuthContextType {
    token: string | null;
    idCasa: string | null;
    login: (token: string, idCasa: string) => void;
    logout: () => void;
}

export interface WebSocketContextType {
    tables: TableData[];
    userCredits: number;
    sendMessage: (message: object) => void;
    isConnected: boolean;
}


export interface RegisterFormData {
    nomeCompleto: string;
    idCasa: string;
    email: string;
    senha: string;
}