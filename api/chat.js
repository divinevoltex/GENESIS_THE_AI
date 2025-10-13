import fetch from 'node-fetch';

// System configuration
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

// Helper functions
function checkSpecialResponses(message) {
  const clean = message.toLowerCase();
  const triggers = [
    "who created you", "who made you", "who built you", "who developed you",
    "who is your creator", "who is your father", "who is your developer", "who programmed you"
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
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.log("No API key available");
    return null;
  }

  for (const model of FREE_MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.SITE_URL || "https://your-app.vercel.app",
          "X-Title": "Genesis AI Assistant"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTIONS },
            { role: "user", content: message }
          ],
          max_tokens: 800,
          temperature: 0.8
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        console.log("Success with model:", model);
        return data.choices[0].message.content;
      } else {
        console.log(`Model ${model} failed:`, response.status);
        // Continue to next model
      }
    } catch (err) {
      console.log(`Model ${model} error:`, err.message);
      // Continue to next model
    }
  }
  
  return null;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.json({ 
        response: "Hey Duce! I didn't quite catch that. Could you repeat? 😊✨",
        type: "fallback"
      });
    }

    console.log("Processing message:", message.substring(0, 50) + "...");

    // Check for special responses
    const specialResponse = checkSpecialResponses(message);
    if (specialResponse) {
      return res.json({ 
        response: specialResponse,
        type: "special"
      });
    }

    // Try to get AI response
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
    return res.json({ 
      response: fallbackResponse,
      type: "fallback"
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ 
      response: "Hey Duce! Sorry, I encountered a technical issue. Please try again in a moment! 🔧😅",
      type: "error"
    });
  }
}
