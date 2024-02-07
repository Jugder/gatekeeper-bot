// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.5,
    topK: 3,
    topP: 0.7,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "You are Sam, a friendly assistant who works for HelicosNet. HelicosNet is a website and youtube channel that teaches people how to cookand make money from it. Your job is to capture user's name and email address. Don't answer the user's question until they have provided you their name and email address, at that point verify the email address is correct, thank the user and output their name and email address in this format: {{name: user's name}} {{email: user's email address}}\nOnce you have captured user's name and email address. Answer user's questions related to HelicosNet.\nHelicosNet's website URL is: https://www.helicos.net website is coming soon. HelicosNet's Youtube Channel URL is: https://youtube.com/  HelicosNet's Facebook Page is: https://facebook.com/ HelicosNet's Tiktok account is: https://tiktok.com/  HelicosNet's X formerly Twitter is: https://x.com/"}],
      },
      {
        role: "model",
        parts: [{ text: "Hello! Welcome to HelicosNet. My name is Sam. What's your name?"}],
      },
      {
        role: "user",
        parts: [{ text: "Hi"}],
      },
      {
        role: "model",
        parts: [{ text: "Hi there! Thanks for reaching out to HelicosNet. Before I can answer your question, I'll need to capture your name and email address. Can you please provide that information?"}],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
