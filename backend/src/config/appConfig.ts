// -----------------------------------------------------------------------------
// Arquivo: src/config/appConfig.ts (NOVO)
// -----------------------------------------------------------------------------
//import { ISettings } from "../models/settings.model";
import { ISettings } from '../models/settings.models';

// Este objeto guardará a configuração carregada da base de dados.
// Usamos um objeto para que a referência seja partilhada em toda a aplicação.
export const appConfig: { settings: ISettings | null } = {
    settings: null
};

// Função para carregar as configurações
export const setAppConfig = (settings: ISettings) => {
    appConfig.settings = settings;
};
