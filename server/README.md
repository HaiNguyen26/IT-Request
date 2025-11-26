# IT Request Service API

## Prerequisites

- Node.js 18+
- PostgreSQL (e.g. via pgAdmin)

## Environment

Create a `.env` file in this directory with:

```
DATABASE_URL=postgres://postgres:Hainguyen261097@localhost:5432/it_request
PORT=4000
```

Update the credentials/host as needed for your environment.

## Commands

- `npm run dev` – start only the API in watch mode
- `npm run build` – compile TypeScript to `dist`
- `npm start` – run the compiled build

The repository root also exposes `npm run dev`, which starts both the backend and the React frontend in parallel.

## Database

Run the SQL in `db/schema.sql` to create required tables before starting the API.
