import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGemini() {
    console.log("Testing Gemini AI...");
    const apiKey = process.env.GEMINI_API_KEY || "";
    console.log(`API Key Length: ${apiKey.length}`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    try {
        const result = await model.generateContent("Say 'Gemini is working' if you can read this.");
        const response = await result.response;
        console.log("Gemini Response:", response.text());
        return true;
    } catch (error) {
        console.error("Gemini FAILED:", error);
        return false;
    }
}

async function testGroq() {
    console.log("Testing Groq AI...");
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: "Say 'Groq is working' if you can read this." }]
            })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log("Groq Response:", data.choices[0].message.content);
        return true;
    } catch (error) {
        console.error("Groq FAILED:", error);
        return false;
    }
}

async function runTests() {
    const geminiOk = await testGemini();
    const groqOk = await testGroq();
    
    if (geminiOk && groqOk) {
        console.log("AI Services: ALL OK");
    } else {
        console.log("AI Services: SOME FAILED");
    }
}

runTests();
