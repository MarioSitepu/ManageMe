async function simulateWebhook() {
    console.log("Simulating WhatsApp Webhook POST...");
    const payload = {
        message: "beli nasi goreng 50rb",
        sender: "6281262553164", // Valid user in DB
        type: "text"
    };

    try {
        const response = await fetch("http://localhost:3001/api/whatsapp/webhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Response Data:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Webhook simulation failed:", error);
    }
}

simulateWebhook();
