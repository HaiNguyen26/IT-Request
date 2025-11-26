import dotenv from 'dotenv'

dotenv.config()

const required = (value: string | undefined, key: string) => {
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`)
    }
    return value
}

export const config = {
    port: Number(process.env.PORT ?? 4000),
    databaseUrl: required(process.env.DATABASE_URL, 'DATABASE_URL'),
}
