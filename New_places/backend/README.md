# New Places Backend

TypeScript Express backend for managing places, categories, filters, settings, reviews, and suggestions backed by SQLite and Prisma.

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

1. Copy `.env.example` to `.env` and adjust the values as needed.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Run database migrations and generate the Prisma client:

   ```bash
   npm run prisma:generate
   npm run migrate:dev
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

The API is exposed under `http://localhost:4000/api`.

## Available Scripts

- `npm run dev` – Start the server with automatic reload using `ts-node-dev`.
- `npm run build` – Compile TypeScript into the `dist` directory.
- `npm start` – Launch the compiled JavaScript from the `dist` directory.
- `npm run migrate:dev` – Apply local development migrations.
- `npm run migrate:deploy` – Apply migrations in production environments.
- `npm run prisma:generate` – Generate the Prisma client based on the current schema.

## Authentication

Administrative endpoints require an `x-admin-token` header that matches the `ADMIN_TOKEN` value defined in the environment configuration.
