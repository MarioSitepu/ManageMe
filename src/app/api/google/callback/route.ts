import { NextResponse } from 'next/server';
import { createOAuth2Client } from '@/lib/googleCalendar';
import { prisma } from '@/lib/db';
import { google } from 'googleapis';
import { signToken } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            return NextResponse.redirect(
                new URL(`/login?error=${error}`, request.url)
            );
        }

        if (!code) {
            return NextResponse.redirect(
                new URL(`/login?error=No+authorization+code+provided`, request.url)
            );
        }

        // Exchange code for tokens
        const oauth2Client = createOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.access_token || !tokens.refresh_token) {
            return NextResponse.redirect(
                new URL(`/login?error=Failed+to+get+Google+tokens`, request.url)
            );
        }

        oauth2Client.setCredentials(tokens);

        // Fetch User Info from Google
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });
        const userInfo = await oauth2.userinfo.get();
        const email = userInfo.data.email;

        if (!email) {
            return NextResponse.redirect(
                new URL(`/login?error=Could+not+get+email+from+Google`, request.url)
            );
        }

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: email,
                    // Optionally save name/picture if we add fields to schema later
                },
            });
        }

        // Save Google Calendar tokens to user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token,
                googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            },
        });

        // Generate JWT session token
        const token = await signToken({ userId: user.id, email: user.email });

        // Redirect back to dashboard with cookie
        const response = NextResponse.redirect(new URL('/', request.url));

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
        console.error('Google OAuth callback error:', error);
        return NextResponse.redirect(
            new URL(`/login?error=OAuth+callback+failed`, request.url)
        );
    }
}

