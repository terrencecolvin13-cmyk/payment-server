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
app.use(cors());
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
// (Apple Pay, Google Pay, Cash App Pay, Link, Cards)
// ---------------------------------------------
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).send({ error: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",

      // REQUIRED for Apple Pay, Google Pay, Cash App Pay
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },

      // Optional: explicitly include Cash App Pay + Link
      payment_method_types: [
        "card",
        "cashapp",
        "link",
        "us_bank_account",
      ],
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
