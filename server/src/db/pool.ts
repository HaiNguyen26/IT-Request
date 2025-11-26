import { Pool, type QueryResultRow } from 'pg'
import { config } from '../config'

export const pool = new Pool({
  connectionString: config.databaseUrl,
})

pool.on('error', (err: Error) => {
  console.error('Unexpected PG pool error', err)
})

export const query = <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) =>
  pool.query<T>(text, params)
