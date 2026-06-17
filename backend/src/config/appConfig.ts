// -----------------------------------------------------------------------------
// Arquivo: src/config/appConfig.ts (NOVO)
// -----------------------------------------------------------------------------
import { EventEntity } from '../models/postgres/Event.entity';

// Este objeto guardará a configuração carregada da base de dados.
// Usamos um objeto para que a referência seja partilhada em toda a aplicação.
export const appConfig: { settings: EventEntity | null } = {
    settings: null
};

// Função para carregar as configurações
export const setAppConfig = (settings: EventEntity) => {
    appConfig.settings = settings;
};
