import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || '8080',
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/table-reservation',
    jwtSecret: process.env.JWT_SECRET || 'default_secret',
};
