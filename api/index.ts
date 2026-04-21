import express from "express";

const app = express();
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/debug-env", (req, res) => {
  res.json({ 
    keys: Object.keys(process.env).filter(k => k.includes("GEMINI") || k.includes("API") || k.includes("GOOGLE")),
    nodeEnv: process.env.NODE_ENV
  });
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

export default app;
