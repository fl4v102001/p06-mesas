import mongoose from 'mongoose';

export const connectDB = async (uri: string) => {
    try {
        await mongoose.connect(uri);
        console.log('Conectado ao MongoDB com sucesso.');
    } catch (error) {
        console.error('Falha ao conectar ao MongoDB:', error);
        process.exit(1);
    }
};