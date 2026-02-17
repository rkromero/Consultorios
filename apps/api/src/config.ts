import dotenv from 'dotenv';
dotenv.config();

export const config = {
    PORT: process.env.PORT || 3001,
    JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey',
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV || 'development',
};
