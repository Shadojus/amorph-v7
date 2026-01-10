/**
 * BIFROEST Prisma Client
 * Singleton instance for database access
 */

// Load .env file before Prisma initialization
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Try multiple .env locations (amorph local -> root project)
const envPaths = [
  resolve(__dirname, '../../.env'),      // amorph/.env (if running from src/server)
  resolve(__dirname, '../../../.env'),   // root .env (if running from src/server)
  resolve(process.cwd(), '.env'),        // current working directory
  resolve(process.cwd(), '../.env'),     // parent of cwd
];

let envPath = '';
let result = { error: new Error('No .env found') as Error | undefined };

for (const path of envPaths) {
  if (existsSync(path)) {
    envPath = path;
    result = config({ path });
    break;
  }
}

// Debug: Log DATABASE_URL status with more detail
console.log('[AMORPH-DB] .env path:', envPath || 'NOT FOUND');
console.log('[AMORPH-DB] dotenv result:', result.error ? `Error: ${result.error.message}` : 'OK');
console.log('[AMORPH-DB] DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@') || 'NOT SET');

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
