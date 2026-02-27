import { neon } from '@neondatabase/serverless';
import { PrismaClient } from '@prisma/client';

// Explicit DB URL - fallback in case Next.js workspace root detection misreads .env.local
const DATABASE_URL = process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_pV5HuqTK7cgy@ep-ancient-surf-a17ignjr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// Initialize Neon connection
const sql = neon(DATABASE_URL);

// Prisma Client singleton pattern for Next.js
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasourceUrl: DATABASE_URL,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export Neon SQL for direct queries if needed
export { sql };

// Helper function to handle database errors
export function handleDatabaseError(error: unknown) {
    console.error('Database error:', error);

    if (error instanceof Error) {
        return {
            error: error.message,
            code: 'DATABASE_ERROR'
        };
    }

    return {
        error: 'An unknown database error occurred',
        code: 'UNKNOWN_ERROR'
    };
}
