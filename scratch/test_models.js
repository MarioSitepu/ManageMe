const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
    try {
        // The SDK doesn't have a direct listModels but we can try to fetch a known one
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Model object created");
        
        // Try a tiny request
        const res = await model.generateContent("test");
        console.log("Response received:", res.response.text());
    } catch (e) {
        console.error("Error:", e.message);
    }
}

listModels();
