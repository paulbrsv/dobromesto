import { migration as initialSchema } from './20240515000100_initial_schema';

export type Migration = {
  id: string;
  statements: string[];
};

export const migrations: Migration[] = [initialSchema];
