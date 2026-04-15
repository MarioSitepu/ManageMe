import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { detectExpenseFromImage } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { image } = await req.json(); // Base64 image
        if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

        // Extract mime type if available
        let mimeType = "image/jpeg";
        if (image.startsWith('data:')) {
            const match = image.match(/^data:([^;]+);/);
            if (match) mimeType = match[1];
        }

        const data = await detectExpenseFromImage(image, mimeType);
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Expense Detection API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze screenshot' }, 
            { status: 500 }
        );
    }
}
