import { neon } from '@neondatabase/serverless';
import { PrismaClient } from '@prisma/client';

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL!);

// Prisma Client singleton pattern for Next.js
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
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
