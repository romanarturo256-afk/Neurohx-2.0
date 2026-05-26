import express from "express";
import jwt from "jsonwebtoken";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());

// Lazy-initialized Gemini client to prevent crashes if key is initially absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "undefined") {
      throw new Error("GEMINI_API_KEY is not configured. Please add it to your project secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/debug-env", (req, res) => {
  res.json({ 
    keys: Object.keys(process.env).filter(k => k.includes("GEMINI") || k.includes("API") || k.includes("GOOGLE") || k.includes("CHATBOT")),
    nodeEnv: process.env.NODE_ENV
  });
});

// Chatbase Identify Token Generation
app.post("/api/chatbase-token", async (req, res) => {
  try {
    const secret = process.env.CHATBOT_IDENTITY_SECRET;
    if (!secret) {
      console.warn("⚠️ CHATBOT_IDENTITY_SECRET is not configured in the environment.");
    }

    const { userId, email, stripe_accounts } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Sign jwt token with payload matching requirements
    const token = jwt.sign(
      { 
        user_id: userId, 
        email: email || null, 
        stripe_accounts: stripe_accounts || [] 
      }, 
      secret || "dev_fallback_secret_key", 
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error generating Chatbase token:", error);
    res.status(500).json({ error: "Error signing user token" });
  }
});

// Razorpay Order Creation (Mock/Structure)
app.post("/api/payments/create-order", async (req, res) => {
  const { amount } = req.body;
  res.json({
    id: `order_${Math.random().toString(36).substring(7)}`,
    amount: (amount || 0) * 100,
    currency: "INR"
  });
});

// Razorpay Subscription Creation (Mock/Structure)
app.post("/api/payments/create-subscription", async (req, res) => {
  // In a real app, you'd use the Razorpay SDK
  res.json({
    id: `sub_${Math.random().toString(36).substring(7)}`,
    status: 'created'
  });
});

// Secure server-side Gemini API proxy route
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { contents, config, model } = req.body;
    const ai = getGeminiClient();
    
    // Choose model (defaulting to the recommended gemini-3.5-flash)
    const selectedModel = model || "gemini-3.5-flash";

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("❌ Gemini API server route error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini generation" });
  }
});

export default app;
