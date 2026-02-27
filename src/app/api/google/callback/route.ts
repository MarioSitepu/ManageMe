import { NextResponse } from 'next/server';
import { createOAuth2Client } from '@/lib/googleCalendar';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            return NextResponse.redirect(
                new URL(`/?google_error=${error}`, request.url)
            );
        }

        if (!code) {
            return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
        }

        // Exchange code for tokens
        const oauth2Client = createOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.access_token || !tokens.refresh_token) {
            return NextResponse.json({ error: 'Failed to get tokens' }, { status: 400 });
        }

        // Save tokens to the default user
        // First, ensure default user exists
        let user = await prisma.user.findFirst();

        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: 'default-user',
                    email: 'default@trackme.local',
                },
            });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token,
                googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            },
        });

        // Redirect back to app with success message
        return NextResponse.redirect(
            new URL('/?google_connected=true', request.url)
        );
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        return NextResponse.json({ error: 'OAuth callback failed' }, { status: 500 });
    }
}
