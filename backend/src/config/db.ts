import { AppDataSource } from './data-source';

export const connectDB = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Conectado ao Postgres (TypeORM) com sucesso.');
    } catch (error) {
        console.error('Falha ao conectar ao Postgres:', error);
        process.exit(1);
    }
};