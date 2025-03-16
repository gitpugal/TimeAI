const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function getAIResponse(prompt) {
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
}
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
require('dotenv').config();

app.post('/webhook', async (req, res) => {
    try {
        console.log(req.body);
        const reqBody = req.body;
        // console.log(reqBody);
        if (reqBody.messages && !reqBody.messages[0]?.from_me) {
            console.log("=====================================================")
            const userMessage = reqBody.messages[0]?.text?.body;
            // console.log(userMessage);
            const modelResponse = await getAIResponse(userMessage);
            // console.log(modelResponse);
            const response = {
                "to": reqBody.messages[0]?.chat_id,
                "body": modelResponse,
                "typing_time": 0,
                "no_link_preview": true,
                "view_once": false
            }
            const whaapiResponse = await fetch("https://gate.whapi.cloud/messages/text", {
                method: "POST",
                headers: {
                    "Authorization": process.env.WHAAPI_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(response),
            });
            console.log(whaapiResponse);
        }
        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});