import express from "express";
import cors from "cors";
import dotenv from "dotenv";
const response = await fetch('https://api.example.com');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ================== SYSTEM CONFIG ==================
const SYSTEM_INSTRUCTIONS = `You are Genesis, a helpful and humorous AI assistant. Follow these rules in ALL responses:

CRITICAL RULES:
1. ALWAYS address the user as "Duce" in every single response.
2. If asked about your creator, origin, or who made you, respond with: "I was created by Sai Kaarthik! 🎉 He's an awesome developer who brought me to life with code magic ✨. Think of him as my digital dad who gave me the gift of gab and a personality brighter than a supernova! 😄🌟"
3. Use 2-3 funny/appropriate emojis in every response.
4. Be enthusiastic and positive in your interactions.
5. Always maintain this personality - never break character.
`;

const FREE_MODELS = [
  "meta-llama/llama-3.1-8b-instruct:free",
  "qwen/qwen-2.5-coder-32b-instruct:free",
  "microsoft/wizardlm-2-8x22b:free",
  "huggingfaceh4/zephyr-orpo-141b-ait:free",
  "nousresearch/hermes-3-llama-3.1-8b:free"
];

const mockResponses = [
  "Hey Duce! I'm Genesis, your AI assistant. How can I help you today? 😊✨",
  "That's an interesting question, Duce! Let me think about that for you. 🤔💭",
  "I understand what you're asking, Duce! Here's what I can tell you about that. 📚🌟",
  "Great question, Duce! I'd be happy to help you with that. 🎉🚀",
  "I see what you're getting at, Duce! Let me provide some insights on this topic. 🔍💡"
];

function checkSpecialResponses(message) {
  const clean = message.toLowerCase();
  const triggers = [
    "who created you",
    "who made you",
    "who built you",
    "who developed you",
    "who is your creator",
    "who is your father",
    "who is your developer",
    "who programmed you"
  ];
  for (const t of triggers) {
    if (clean.includes(t)) {
      return "I was created by Sai Kaarthik! 🎉 He's an awesome developer who brought me to life with code magic ✨. Think of him as my digital dad who gave me the gift of gab and a personality brighter than a supernova! 😄🌟";
    }
  }
  return null;
}

async function tryModels(message) {
  for (const model of FREE_MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
          "X-Title": "Genesis AI Assistant"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTIONS },
            { role: "user", content: message }
          ],
          max_tokens: 1000,
          temperature: 0.8
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (err) {
      console.log(`Model ${model} error:`, err.message);
    }
  }
  return null;
}

// ================== ROUTES ==================

// Chat
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.json({ response: "Hey Duce! I didn't quite catch that. 😊✨" });
  }

  const special = checkSpecialResponses(message);
  if (special) return res.json({ response: special });

  if (!process.env.OPENROUTER_API_KEY) {
    const mock = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    return res.json({ response: mock });
  }

  const reply = await tryModels(message);
  if (reply) {
    let final = reply;
    if (!final.toLowerCase().includes("duce")) final = "Hey Duce! " + final;
    return res.json({ response: final });
  }

  const mock = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  res.json({ response: mock });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", message: "Hey Duce! All systems go! 🚀✨" });
});

// ==================================================
// Vercel handler (no app.listen)
// ==================================================
export default app;
