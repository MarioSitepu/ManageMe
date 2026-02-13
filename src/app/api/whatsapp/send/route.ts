import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { phone, message } = await request.json();

        if (!phone || !message) {
            return NextResponse.json(
                { error: 'Phone number and message are required' },
                { status: 400 }
            );
        }

        const FONNTE_API_KEY = process.env.FONNTE_API_KEY;

        if (!FONNTE_API_KEY) {
            console.error('FONNTE_API_KEY not configured');
            return NextResponse.json(
                { error: 'WhatsApp service not configured' },
                { status: 500 }
            );
        }

        // Send message via FONNTE API
        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': FONNTE_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                target: phone,
                message: message,
                countryCode: '62' // Indonesia
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('FONNTE API error:', data);
            return NextResponse.json(
                { error: 'Failed to send WhatsApp message', details: data },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'WhatsApp message sent successfully',
            data
        });

    } catch (error: any) {
        console.error('WhatsApp send error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
