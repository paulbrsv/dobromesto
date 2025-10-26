# DobroMesto Monorepo

This repository now includes the original DobroMesto frontend along with the **New Places** sub-project, which is composed of separate frontend and backend TypeScript applications. Each sub-project is fully isolated with its own tooling so you can work on only what you need.

## Structure

```
New_places/
├── frontend/   # Vite + React + TypeScript application
└── backend/    # Node.js + TypeScript application
```

Both parts share a common TypeScript, ESLint, and Prettier setup defined at `New_places/` to keep the coding style consistent.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- [npm](https://www.npmjs.com/) 9 or newer

> **Note:** Installing dependencies from the npm registry may require additional network configuration if you are behind a proxy or working offline.

## Setup

Install dependencies independently for each package:

```bash
cd New_places/frontend
npm install

cd ../backend
npm install
```

The `prepare` script will configure Husky to run ESLint before every commit the first time `npm install` finishes successfully.

## Scripts

Each package exposes a similar set of scripts so you can use the same workflow across the frontend and backend:

### Frontend (`New_places/frontend`)

- `npm run dev` – start the Vite development server with hot module replacement.
- `npm run build` – type-check the project and create an optimized production build.
- `npm run lint` – lint all TypeScript and TSX files with ESLint.
- `npm run preview` – preview the production build locally.
- `npm run format` – format source files with Prettier.

TypeScript path aliases are configured via `@/*` and resolved through both the shared `tsconfig.base.json` and Vite (`vite.config.ts`).

### Backend (`New_places/backend`)

- `npm run dev` – run the Node.js server with automatic reloads (`ts-node-dev`) and support for the `@/*` alias via `tsconfig-paths/register`.
- `npm run build` – emit compiled JavaScript into `dist/` and rewrite path aliases using `tsc-alias`.
- `npm run lint` – lint all TypeScript source files with ESLint.
- `npm run format` – format the source files with Prettier.

The backend also uses the shared `tsconfig.base.json` and `@/*` alias for module resolution.

## Husky & Linting

Husky hooks are set up in each package to run `npm run lint` before commits. ESLint and Prettier rules are centralised in `New_places/eslint.base.cjs` and `New_places/prettier.config.cjs`, ensuring both projects follow the same style guide.

## Development Tips

- Keep shared linting or formatting rules in the `New_places/` root to avoid duplication between packages.
- When adding new path aliases, update both the package-specific `tsconfig.json` and any build tooling (`vite.config.ts` or runtime helpers) to keep builds and runtime environments in sync.

Happy coding!
