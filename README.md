# pet-grooming-app

Backend API for a small multi-tenant Pet Grooming SaaS, built with [NestJS](https://nestjs.com/) and TypeScript.

## Requirements

- Node.js 24 LTS (see `.nvmrc`; run `nvm use` if you use nvm)
- npm 10+

## Getting started

```bash
npm install
npm run start:dev
```

The API listens on `http://localhost:3000` by default (override with the `PORT` environment variable).

Verify it is running:

```bash
curl http://localhost:3000/
# {"message":"Pet Grooming API is running"}
```

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run start:dev` | Start in watch mode (development)            |
| `npm run build`     | Compile TypeScript to `dist/`                |
| `npm run start:prod`| Run the compiled build from `dist/`          |
| `npm run lint`      | Lint with oxlint                             |
| `npm run typecheck` | Type-check without emitting                  |
| `npm test`          | Run unit tests                               |
| `npm run test:e2e`  | Run end-to-end tests                         |
| `npm run format`    | Format source with Prettier                  |
