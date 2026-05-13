// ---------------------------------------------
// DISTRICT THREADS PAYMENT SERVER
// Supports:
// - Apple Pay
// - Google Pay
// - Cash App Pay
// - Link
// - Cards
// ---------------------------------------------

import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();

// ---------------------------------------------
// CORS CONFIG (REQUIRED FOR BASE44)
// ---------------------------------------------
app.use(
  cors({
    origin: [
      "https://district-threads-9825d602.base44.app",
      "https://app.base44.com",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ---------------------------------------------
// STRIPE INIT
// ---------------------------------------------
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY in Render environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// ---------------------------------------------
// TEST ROUTE
// ---------------------------------------------
app.get("/", (req, res) => {
  res.send("District Threads payment server is running.");
});

// ---------------------------------------------
// CREATE PAYMENT INTENT
// ---------------------------------------------
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).send({ error: "Amount is required" });
    }

    // ⭐ FIXED: Removed payment_method_types (conflicts with automatic_payment_methods)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error("❌ Stripe Error:", error);
    res.status(500).send({ error: error.message });
  }
});

// ---------------------------------------------
// START SERVER
// ---------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Payment server running on port ${PORT}`);
});
