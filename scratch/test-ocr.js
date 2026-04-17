// test-ocr.js
const { detectExpenseFromImage } = require('../src/lib/gemini');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testOCR() {
    console.log('--- TESTING OCR PROMPT LOGIC ---');
    console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? 'FOUND' : 'MISSING');
    
    // Using a fake base64 of a 1x1 black pixel for structural trace (since we can't test real image easily)
    const fakeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    
    try {
        console.log('Calling Gemini with mock image...');
        // This will likely fail or return empty/null as it's a black pixel, 
        // but we verify if it handles the return structure correctly.
        const result = await detectExpenseFromImage(fakeBase64, 'image/png');
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error during test:', error.message);
    }
}

testOCR();
