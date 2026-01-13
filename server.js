import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// ================== TEST FETCH (optional, async) ==================
(async () => {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    const data = await response.json();
    console.log("Initial test fetch:", data);
  } catch (err) {
    console.error("Test fetch failed:", err);
  }
})();

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
  "I see what you're getting at, Duce! Let me provide some insights on this topic. 🔍💡",
  "Hey Duce! Thanks for chatting with me! What's on your mind? 😄🌟",
  "Duce! Great to hear from you! How can I assist you today? 🚀✨"
];

// ================== HELPER FUNCTIONS ==================
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

function getMockResponse() {
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
}

async function tryModels(message) {
  console.log("Attempting to fetch from OpenRouter with API key:", 
    process.env.OPENROUTER_API_KEY ? "Present" : "Missing");
  
  for (const model of FREE_MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.SITE_URL || "https://genesis-ai.onrender.com",
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
        }),
        timeout: 30000 // 30 second timeout
      });

      console.log(`Model ${model} response status:`, response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Successfully got response from:", model);
        return data.choices[0].message.content;
      } else {
        const errorText = await response.text();
        console.log(`Model ${model} failed:`, response.status, errorText);
      }
    } catch (err) {
      console.log(`Model ${model} error:`, err.message);
    }
  }
  
  console.log("All models failed, using fallback response");
  return null;
}

// ================== ROUTES ==================

// Chat Route
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === "") {
      return res.json({ 
        response: "Hey Duce! I didn't quite catch that. Could you repeat? 😊✨",
        type: "fallback"
      });
    }

    console.log("Received message:", message);

    // Check for special responses
    const specialResponse = checkSpecialResponses(message);
    if (specialResponse) {
      return res.json({ 
        response: specialResponse,
        type: "special"
      });
    }

    // Check if API key is available
// Remove or comment the OPENROUTER_API_KEY check section
// Change this part in server.js:

// Instead of hardcoded API key check, only check environment
if (!process.env.OPENROUTER_API_KEY) {
  console.log("No OpenRouter API key found in environment");
  console.log("Please add OPENROUTER_API_KEY in Render environment variables");
  // Continue with mock responses
}

    // Try to get response from AI models
    const aiResponse = await tryModels(message);
    
    if (aiResponse) {
      let finalResponse = aiResponse;
      // Ensure the response addresses Duce
      if (!finalResponse.toLowerCase().includes("duce")) {
        finalResponse = "Hey Duce! " + finalResponse;
      }
      return res.json({ 
        response: finalResponse,
        type: "ai"
      });
    }

    // Fallback to mock response
    console.log("Using fallback mock response");
    const fallbackResponse = getMockResponse();
    res.json({ 
      response: fallbackResponse,
      type: "fallback"
    });

  } catch (error) {
    console.error("Server error in /api/chat:", error);
    res.status(500).json({ 
      response: "Hey Duce! Sorry, I encountered a technical issue. Please try again in a moment! 🔧😅",
      type: "error"
    });
  }
});

// Health Check Route
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    message: "Hey Duce! All systems go! 🚀✨",
    hasApiKey: !!process.env.OPENROUTER_API_KEY,
    environment: process.env.NODE_ENV || "development"
  });
});

// Root route - serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Catch-all for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Genesis AI server is running on port ${PORT}`);
  console.log(`🔑 OpenRouter API Key: ${process.env.OPENROUTER_API_KEY ? "Present" : "Missing"}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📁 Static files served from: ${path.join(__dirname, "public")}`);
});
