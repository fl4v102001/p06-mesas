import { DataSource } from 'typeorm';
import { EventEntity } from '../models/postgres/Event.entity';
import { SeatEntity } from '../models/postgres/Seat.entity';
import { CreditEntity } from '../models/postgres/Credit.entity';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/table_reservation',
    synchronize: false, // TODO: Consider changing to false for production
    logging: false,
    entities: [EventEntity, SeatEntity, CreditEntity],
    subscribers: [],
    migrations: [],
});
