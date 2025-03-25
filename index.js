import express from "express"
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv'
import mongoose from "mongoose";
// const express = require('express');
// const fetch = require('node-fetch');
// import fetch from 'node-fetch';
// const { GoogleGenerativeAI } = require("@google/generative-ai");
dotenv.config();

async function getAIResponse(prompt) {
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
}


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database Connected Successfully!");
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/webhook', async (req, res) => {
    try {
        console.log(req.body); // Log incoming request body

        const reqBody = req.body;
        
        if (reqBody.event === 'message_create' && reqBody.data?.message?.fromMe === false) {
            console.log("=====================================================");
            
            const userMessage = reqBody.data?.message?.body;
            console.log("User Message:", userMessage);
            
            if (!userMessage) {
                return res.status(400).json({ success: false, message: "No message body found" });
            }

            const modelResponse = await getAIResponse(userMessage);
            console.log("AI Response:", modelResponse);

            const response = {
                "to": reqBody.data?.message?.from, // Send response to the sender
                "body": modelResponse,
                "typing_time": 0,
                "no_link_preview": true,
                "view_once": false
            };

            console.log("Response Payload:", response);

            const whaapiResponse = await fetch("https://gate.whapi.cloud/messages/text", {
                method: "POST",
                headers: {
                    "Authorization": process.env.WHAAPI_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(response),
            });

            const whaapiData = await whaapiResponse.json();
            console.log("WhatsApp API Response:", whaapiData);
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
