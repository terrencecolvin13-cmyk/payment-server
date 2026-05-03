const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// test route
app.get("/", (req, res) => {
  res.send("Payment server running");
});

// create checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Your Product"
            },
            unit_amount: 2000
          },
          quantity: 1
        }
      ],
      success_url: "https://your-site.com/success",
      cancel_url: "https://your-site.com/cancel"
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating checkout session");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});