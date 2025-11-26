import bcrypt from 'bcryptjs'
import { query } from '../db/pool'

const DEFAULT_ACCOUNTS = [
  {
    role: 'itManager',
    username: 'trunghai',
    password: 'RMG123@',
    displayName: 'Nguyễn Trung Hải',
    email: 'nguyen.trung.hai@rmg123.com',
    department: 'IT Operations',
  },
  {
    role: 'leadership',
    username: 'thanhtung',
    password: 'RMG123@',
    displayName: 'Lê Thanh Tùng',
    email: 'le.thanh.tung@rmg123.com',
    department: 'Điều hành',
  },
] as const

export const ensureDefaultManagementAccounts = async () => {
  for (const account of DEFAULT_ACCOUNTS) {
    const normalizedUsername = account.username.trim().toLowerCase()
    const passwordHash = await bcrypt.hash(account.password, 10)
    await query(
      `INSERT INTO management_accounts (role, username, password_hash, display_name, email, department)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (username) DO UPDATE
         SET role = EXCLUDED.role,
             password_hash = EXCLUDED.password_hash,
             display_name = EXCLUDED.display_name,
             email = EXCLUDED.email,
             department = EXCLUDED.department,
             updated_at = NOW()`,
      [account.role, normalizedUsername, passwordHash, account.displayName, account.email, account.department],
    )
  }
}

