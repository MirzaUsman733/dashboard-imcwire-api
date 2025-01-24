const stripe = require("stripe")(process.env.EXPRESS_STRIPE_SECRET_KEY);

// ✅ **One API to Create and Retrieve Stripe Payment Session**
exports.handleStripePayment = async (req, res) => {
  const { email, totalPrice, clientId } = req.body;

  if (!email || !totalPrice || !clientId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // ✅ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: totalPrice * 100, // Stripe expects amount in cents
            product_data: {
              name: "Press Release",
            },
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      client_reference_id: clientId,
      mode: "payment",
      success_url: `https://dashboard.imcwire.com/thankyou-stripe/${clientId}?isvalid=true`,
      cancel_url: `https://dashboard.imcwire.com/thankyou-stripe/${clientId}?isvalid=false`,
    });

    // ✅ Retrieve Session Details Immediately
    const sessionDetails = await stripe.checkout.sessions.retrieve(session.id);

    res.status(200).json({
      sessionId: session.id,
      sessionUrl: session.url,
      payment_status: sessionDetails.payment_status,
      amount_total: sessionDetails.amount_total / 100, // Convert back to dollars
      currency: sessionDetails.currency,
      client_reference_id: sessionDetails.client_reference_id,
    });
  } catch (err) {
    res.status(500).json({ error: `Checkout Error: ${err.message}` });
  }
};




