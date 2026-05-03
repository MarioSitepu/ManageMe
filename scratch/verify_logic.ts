import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { detectExpenseFromImage } from '../src/lib/gemini';

// Set up env for API keys
dotenv.config({ path: '.env.local' });

const receiptPath = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\cdd2bdc9-7103-40c9-a9cb-d9f5d28f954b\\test_receipt_1776444838753.png';
const landscapePath = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\cdd2bdc9-7103-40c9-a9cb-d9f5d28f954b\\test_landscape_1776444854717.png';

async function runTest(imagePath: string, label: string) {
    console.log(`\n--- Testing ${label} ---`);
    if (!fs.existsSync(imagePath)) {
        console.error(`File not found: ${imagePath}`);
        return;
    }

    const buffer = fs.readFileSync(imagePath);
    const base64 = buffer.toString('base64');
    
    try {
        const result = await detectExpenseFromImage(base64, 'image/png');
        console.log('Result:', JSON.stringify(result, null, 2));
        
        if (label === 'Receipt' && result.isReceipt) {
            console.log('✅ Correctly identified as Receipt!');
        } else if (label === 'Landscape' && !result.isReceipt) {
            console.log('✅ Correctly identified as NOT a Receipt!');
        } else {
            console.log('❌ Incorrect identification.');
        }
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

async function main() {
    await runTest(receiptPath, 'Receipt');
    await runTest(landscapePath, 'Landscape');
}

main();
