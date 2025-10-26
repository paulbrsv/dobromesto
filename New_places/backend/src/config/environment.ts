import dotenv from 'dotenv';

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? 'file:./dev.db',
  adminToken: process.env.ADMIN_TOKEN ?? '',
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

export default env;
