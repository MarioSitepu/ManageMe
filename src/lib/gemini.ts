import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface DetectedExpense {
    amount: number;
    description: string;
    category: string;
    account?: string; // New field: identified source of funds
}

/**
 * Uses Gemini 1.5 Flash to extract transaction details from a base64 image.
 */
export async function detectExpenseFromImage(base64Image: string, mimeType: string = "image/jpeg"): Promise<DetectedExpense> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    // Handle data URL vs raw base64
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    const prompt = `
        Analyze this screenshot or photo of a financial transaction or receipt.
        Extract the total amount, a brief description, categorize it, and identify the payment source (Bank/E-wallet).
        
        Return the data in this JSON format:
        {
            "amount": number,
            "description": "string",
            "category": "Food" | "Transport" | "Entertainment" | "Shopping" | "Bills" | "Other",
            "account": "string" | null
        }
        
        Guidelines:
        - "amount": The total paid amount. Only numbers, no currency symbols.
        - "description": A concise name for the transaction (e.g., "Gojek", "Lunch at Warteg", "Electricity Bill").
        - "category": Match to one of the provided categories. 
        - "account": The identified source of funds (e.g., "BCA", "GoPay", "DANA", "OVO", "Mandiri", "SeaBank"). 
          If you see a bank logo or name, extract it. If not clearly visible, return null.
        
        If the text is in Indonesian:
        - Totalkan jumlah pembayaran.
        - Deskripsi singkat dan jelas.
        - Identifikasi sumber dana (Bank/E-Wallet/Cash).
        
        Return ONLY the raw JSON object.
    `;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        }
    ]);

    const response = await result.response;
    const text = response.text();
    
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Gemini parse error. Raw text:", text);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Could not parse transaction details from image");
    }
}
