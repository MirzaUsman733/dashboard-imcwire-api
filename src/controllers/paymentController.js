const stripe = require("stripe")(process.env.EXPRESS_STRIPE_SECRET_KEY);
const connection = require("../config/dbconfig");
const { transporter } = require("../config/transporter");
require('dotenv').config();  // This loads variables from a .env file

// ✅ **One API to Create and Retrieve Stripe Payment Session**
// exports.handleStripePayment = async (req, res) => {
//   const { email, totalPrice, clientId } = req.body;

//   if (!email || !totalPrice || !clientId) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     // ✅ Create Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             unit_amount: totalPrice * 100, // Stripe expects amount in cents
//             product_data: {
//               name: "Press Release",
//             },
//           },
//           quantity: 1,
//         },
//       ],
//       customer_email: email,
//       client_reference_id: clientId,
//       mode: "payment",
//       success_url: `https://dashboard.imcwire.com/thankyou-stripe/${clientId}?isvalid=true`,
//       cancel_url: `https://dashboard.imcwire.com/thankyou-stripe/${clientId}?isvalid=false`,
//     });

//     // ✅ Retrieve Session Details Immediately
//     const sessionDetails = await stripe.checkout.sessions.retrieve(session.id);

//     res.status(200).json({
//       sessionId: session.id,
//       sessionUrl: session.url,
//       payment_status: sessionDetails.payment_status,
//       amount_total: sessionDetails.amount_total / 100, // Convert back to dollars
//       currency: sessionDetails.currency,
//       client_reference_id: sessionDetails.client_reference_id,
//     });
//   } catch (err) {
//     res.status(500).json({ error: `Checkout Error: ${err.message}` });
//   }
// };

exports.handleStripePayment = async (req, res) => {
  let dbConnection;

  try {
    const { email, totalPrice, clientId } = req.body;

    if (!email || !totalPrice || !clientId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    dbConnection = await connection.getConnection(); // Get a DB connection from the pool
    await dbConnection.beginTransaction(); // Start a transaction

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
      success_url: `https://dashboard.imcwire.com/dashboard/thankyou/${clientId}?isvalid=true`,
      cancel_url: `https://dashboard.imcwire.com/dashboard/thankyou/${clientId}?isvalid=false`,
    });

    // ✅ Retrieve Session Details Immediately
    const sessionDetails = await stripe.checkout.sessions.retrieve(session.id);

    if (!sessionDetails || sessionDetails.payment_status !== "unpaid") {
      await dbConnection.rollback();
      return res.status(500).json({ error: "Failed to create Stripe session" });
    }

    await dbConnection.commit();
    dbConnection.release();

    res.status(200).json({
      sessionId: session.id,
      sessionUrl: session.url,
      payment_status: sessionDetails.payment_status,
      amount_total: sessionDetails.amount_total / 100, // Convert back to dollars
      currency: sessionDetails.currency,
      client_reference_id: sessionDetails.client_reference_id,
    });
  } catch (err) {
    if (dbConnection) await dbConnection.rollback(); // Rollback in case of an error
    if (dbConnection) dbConnection.release(); // Ensure the connection is released

    res.status(500).json({ error: `Checkout Error: ${err.message}` });
  }
};

// ✅ Fetch Payment History for a Specific User
exports.getPaymentHistoryByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const [payments] = await connection.query(
      "SELECT * FROM payment_history WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    return res.status(200).json({ success: true, payments });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Fetch All Payment Histories (Super Admin)
exports.getAllPaymentHistories = async (req, res) => {
  try {
    const [payments] = await connection.query(
      "SELECT * FROM payment_history ORDER BY created_at DESC"
    );

    return res.status(200).json({ success: true, payments });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Fetch Payment History for Authenticated User (Users Only)
exports.getUserPaymentHistory = async (req, res) => {
  const user_id = req.user.id;
  try {
    const [payments] = await connection.query(
      "SELECT * FROM payment_history WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );

    return res.status(200).json({ success: true, payments });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.addCustomPayment = async (req, res) => {
  const {
    prId,
    user_id,
    transactionId,
    amountPaid,
    currency,
    paymentMethod,
    receiptEmail,
  } = req.body;

  if (
    !prId ||
    !user_id ||
    !transactionId ||
    !amountPaid ||
    !currency ||
    !paymentMethod ||
    !receiptEmail
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let dbConnection;
  try {
    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction();

    // ✅ Check if pr_id exists in pr_data
    const [prCheck] = await dbConnection.query(
      "SELECT id FROM pr_data WHERE id = ?",
      [prId]
    );

    if (prCheck.length === 0) {
      return res.status(400).json({ error: `PR ID ${prId} does not exist.` });
    }

    // ✅ Update PR Status to "paid"
    await dbConnection.query(
      "UPDATE pr_data SET payment_status = 'paid' WHERE id = ?",
      [prId]
    );

    // ✅ Insert Payment Record into `payment_history`
    await dbConnection.query(
      "INSERT INTO payment_history (pr_id, user_id, stripe_session_id, transaction_id, amount, currency, payment_status, payment_method, receipt_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        prId,
        user_id,
        "manual_payment",
        transactionId,
        amountPaid,
        currency,
        "paid",
        paymentMethod,
        receiptEmail,
      ]
    );

    await dbConnection.commit();

    // ✅ Send Email to Customer
    const mailOptions = {
      from: "IMCWire <Orders@imcwire.com>",
      to: receiptEmail,
      subject: `Your Manual Payment Has Been Processed - Transaction ${transactionId}`,
      html: `
        <p>Dear Customer,</p>
        <p>Your manual payment of <strong>$${amountPaid} ${currency.toUpperCase()}</strong> has been successfully processed.</p>
        <p>Your PR status has been updated to <strong>Paid</strong>.</p>
        <p>Thank you for choosing IMCWire!</p>
        <p>Best Regards,<br>IMCWire Team</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Error sending email to customer:", emailError);
    }

    // ✅ Send Email to Admin
    const adminEmails = ["admin@imcwire.com", "imcwirenotifications@gmail.com"];
    const adminMailOptions = {
      from: "IMCWire <Orders@imcwire.com>",
      to: adminEmails.join(","),
      subject: `New Manual Payment Received - Transaction ${transactionId}`,
      html: `
          <p>New manual payment recorded:</p>
          <ul>
            <li><strong>Transaction ID:</strong> ${transactionId}</li>
            <li><strong>Amount:</strong> $${amountPaid} ${currency.toUpperCase()}</li>
            <li><strong>Payment Method:</strong> ${paymentMethod}</li>
            <li><strong>User Email:</strong> ${receiptEmail}</li>
          </ul>
        `,
    };

    try {
      await transporter.sendMail(adminMailOptions);
    } catch (emailError) {
      console.error("Error sending email to admin:", emailError);
    }

    return res
      .status(200)
      .json({ message: "Manual payment added successfully" });
  } catch (error) {
    if (dbConnection) {
      await dbConnection.rollback();
    }

    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  } finally {
    if (dbConnection) {
      dbConnection.release();
    }
  }
};
