const stripe = require("stripe")(process.env.EXPRESS_STRIPE_SECRET_KEY);
const connection = require("../config/dbconfig");
const nodemailer = require("nodemailer");

const endpointSecret = process.env.EXPRESS_STRIPE_WEBHOOK_SECRET;
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "Orders@imcwire.com",
    pass: "Sales@$$1aShahG!!boy,s",
  },
});

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.payment_status === "paid") {
      const clientReferenceId = session.client_reference_id;
      const transactionId = session.id;
      const amountPaid = session.amount_total / 100; // Convert cents to dollars
      const currency = session.currency;
      const receiptEmail = session.customer_email;
      const paymentMethod = session.payment_method_types[0];

      let dbConnection;
      try {
        dbConnection = await connection.getConnection();
        await dbConnection.beginTransaction();

        // ✅ Get PR Data for the Transaction
        const [prData] = await dbConnection.query(
          "SELECT id, user_id FROM pr_data WHERE client_id = ?",
          [clientReferenceId]
        );

        if (!prData.length) {
          throw new Error("PR data not found for this transaction.");
        }

        const prId = prData[0].id;
        const userId = prData[0].user_id;

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
            userId,
            session.id,
            clientReferenceId,
            amountPaid,
            currency,
            "paid",
            paymentMethod,
            receiptEmail,
          ]
        );

        await dbConnection.commit(); // ✅ Commit transaction

        // ✅ Send Email to Customer
        const mailOptions = {
          from: "IMCWire <Orders@imcwire.com>",
          to: receiptEmail,
          subject: "Your Payment Has Been Successfully Processed - IMCWire",
          html: `
              <p>Dear Customer,</p>
              <p>Your payment of <strong>$${amountPaid} ${currency.toUpperCase()}</strong> has been successfully processed.</p>
              <p>Your PR status has been updated to <strong>Paid</strong>. You can now access your PR dashboard.</p>
              <p>Thank you for choosing IMCWire!</p>
              <p>Best Regards,<br>IMCWire Team</p>
            `,
        };
        await transporter.sendMail(mailOptions);

        // ✅ Send Email to Admin
        const adminEmails = [
          "admin@imcwire.com",
          "imcwirenotifications@gmail.com",
        ];
        const adminMailOptions = {
          from: "IMCWire <Orders@imcwire.com>",
          to: adminEmails.join(","),
          subject: `New Payment Received - Transaction ${transactionId}`,
          html: `
              <p>New payment received:</p>
              <ul>
                <li><strong>Transaction ID:</strong> ${transactionId}</li>
                <li><strong>Amount:</strong> $${amountPaid} ${currency.toUpperCase()}</li>
                <li><strong>Payment Method:</strong> ${paymentMethod}</li>
                <li><strong>User Email:</strong> ${receiptEmail}</li>
              </ul>
            `,
        };
        await transporter.sendMail(adminMailOptions);

        // ✅ Send success response
        return res.status(200).json({ received: true });
      } catch (error) {
        if (dbConnection) {
          await dbConnection.rollback(); // Rollback on error
        }
        return res.status(500).json({ error: "Internal Server Error" });
      } finally {
        if (dbConnection) {
          dbConnection.release();
        }
      }
    }
  }

  // Only send this response if no previous response was sent
  return res.status(200).send("Webhook received");
};
