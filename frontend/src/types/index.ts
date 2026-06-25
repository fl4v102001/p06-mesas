// -----------------------------------------------------------------------------
// Arquivo: src/types/index.ts (MODIFICADO)
// -----------------------------------------------------------------------------
export interface TableData {
    _id: string;
    linha: number;
    coluna: number;
    status: 'livre' | 'selecionada' | 'comprada';
    tipo: 'mesa-4' | 'mesa-6'| 'vazio' | 'aquecedor' | null;
    ownerId: string | null;
    nome?: string;
}

export interface UserCreditsData {
    creditos: number;
    creditos_especiais: number;
}

export interface MapUpdatePayload {
    tables: TableData[];
    usersCredits: Record<string, UserCreditsData>;
}

export interface ISettings {
    id: string;
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
    svgUrl: string;
}

export interface EventStatus {
    id_event: number;
    total_mesas: number;
    total_comprado: number;
    total_disponivel: number;
    percentual_comprado: number;
    percentual_disponivel: number;
}

export interface EventSeatsReportItem {
    owner_codigo_lote: string;
    qtd: number;
    seat_name: string[];
}

export interface EventSeatsReport {
    event_name: string;
    items: EventSeatsReportItem[];
}

export interface ConsolidatedSeatsReport {
    owner_codigo_lote: string;
    seat_name: string;
}


export interface AuthContextType {
    token: string | null;
    idCasa: string | null;
    isReadOnly: boolean;
    login: (token: string, idCasa: string, isReadOnly?: boolean) => void;
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
    events: ISettings[];
    setActiveEventId: (id: string) => void;
    isLoading: boolean;
}

export interface LoginFormData {
    idCasa: string;
    Chave: string;
}

