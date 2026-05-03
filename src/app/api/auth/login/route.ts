import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        let { identifier, password } = await request.json();

        // 1. SANITIZE INPUTS (Trim and normalize)
        identifier = identifier?.trim();
        password = password?.trim();

        if (!identifier || !password) {
            return NextResponse.json(
                { error: 'Username/Email and password are required' },
                { status: 400 }
            );
        }

        // 2. LOG ATTEMPT (Use console.log for serverless environments)
        console.log(`[${new Date().toISOString()}] Login Attempt: ID="${identifier}" PW_LEN=${password?.length}`);

        // 3. FIND USER (Case-insensitive)
        console.log('Login attempt for identifier:', identifier);
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: { equals: identifier, mode: 'insensitive' } },
                    { username: { equals: identifier, mode: 'insensitive' } }
                ]
            }
        });

        if (!user) {
            console.log('User not found for identifier:', identifier);
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (!user.password) {
            console.log('User has no password set:', user.email);
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate JWT session token
        const token = await signToken({ userId: user.id, email: user.email });

        // Create response with cookie
        const response = NextResponse.json(
            { success: true, user: { id: user.id, email: user.email, username: user.username } },
            { status: 200 }
        );

        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
