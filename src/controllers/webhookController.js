require('dotenv').config();
const stripe = require("stripe")(process.env.EXPRESS_STRIPE_SECRET_KEY);
const connection = require("../config/dbconfig");
const { transporter } = require("../config/transporter");

const endpointSecret = process.env.EXPRESS_STRIPE_WEBHOOK_SECRET;

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
    const clientReferenceId = session.client_reference_id;
    const transactionId = session.id;
    const amountPaid = session.amount_total / 100; // Convert cents to dollars
    const currency = session.currency;
    const receiptEmail = session.customer_email;
    const paymentMethod = session.payment_method_types[0];
    const paymentStatus = session.payment_status; // 'paid' or 'unpaid'
    if (session.payment_status === "paid") {

      let dbConnection;
      try {
        dbConnection = await connection.getConnection();
        await dbConnection.beginTransaction();

        // ✅ Get PR Data for the Transaction
        const [prData] = await dbConnection.query(
          "SELECT id, plan_id, user_id FROM pr_data WHERE client_id = ?",
          [clientReferenceId]
        );

        if (!prData.length) {
          throw new Error("PR data not found for this transaction.");
        }
        const prId = prData[0].id;
        const plan_item_id = prData[0].plan_id;
        const [planData] = await dbConnection.query(
          "SELECT id, type FROM plan_items WHERE id = ?",
          [plan_item_id]
        );

        const { type } = planData[0];
        // 3️⃣ Update `activate_plan` (plan activation) if provided & plan exists
        if (type === 'custom-plan') {
          await dbConnection.query(
            "UPDATE plan_items SET activate_plan = ? WHERE id = ?",
            [0, plan_item_id]
          );
        }
        const userId = prData[0].user_id;
        if (paymentStatus === "paid") {
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

          // ✅ Add notification for successful payment
          await dbConnection.query(
            "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
            [
              userId,
              "Payment Successful",
              `Your PR Order #${prId} payment of $${amountPaid} was successful.`,
            ]
          );
        } else {
          // ✅ Add notification for failed payment
          await dbConnection.query(
            "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
            [
              userId,
              "Payment Failed",
              `Your PR Order #${prId} payment of $${amountPaid} has failed. Please try again.`,
            ]
          );
        }

        await dbConnection.commit();

        // ✅ Send Email to Customer
        const mailOptions = {
          from: "IMCWire <Orders@imcwire.com>",
          to: receiptEmail,
          subject: `Your Payment Has Been Successfully Processed - PR# ${prId} Transaction ${clientReferenceId}`,
          html: `
        <!DOCTYPE html>
          <html lang="en">
          <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Payment Has Been Successfully Processed - Welcome to IMCWire!</title>
          </head>
          <body style="font-family: Arial, sans-serif;">
  
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
              <h2 style="text-align: center; color: #333;">Your Payment Has Been Successfully Processed - Welcome to IMCWire!</h2>
  
              <p>Dear ${receiptEmail},</p>
  
              <p>We are delighted to inform you that your payment has been successfully processed, and your subscription to IMCWire is now active. Welcome aboard!</p>
  
              <p>Here's a quick recap of the plan you've chosen:</p>
  
              <ul>
                  <li><strong>Total Amount Paid:</strong> $ ${amountPaid}</li>
              </ul>
  
              <p>Your decision to choose IMCWire as your press release distribution partner marks the beginning of an exciting journey. We are committed to providing you with the highest level of service and ensuring your news reaches your targeted audience through premier outlets like Yahoo Finance, Bloomberg, MarketWatch, and many more.</p>
  
              <p><strong>What's Next?</strong></p>
  
              <ol>
                  <li><strong>Dashboard Access:</strong> You can now access your personalized dashboard <a href="dashboard.imcwire.com/press-dashboard/pr-balance">here</a>, where you can manage your press releases, view distribution reports, and access exclusive insights.</li>
                  <li><strong>Schedule Your First Release:</strong> Ready to get started? Schedule your first press release for distribution through your dashboard. If you need any assistance or have special requests, our support team is here to help.</li>
                  <li><strong>Support and Assistance:</strong> For any questions, guidance, or support, feel free to reach out to us at support@imcwire.com. We're here to ensure your experience is seamless and successful.</li>
              </ol>
  
              <p>We're thrilled to have you with us and look forward to supporting your success. Here's to making headlines together!</p>
  
              <p><strong>Warm regards,</strong><br>The IMCWire Team</p>
          </div>  
          </body>
          </html>
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
          subject: `New Payment Received - PR# ${prId} Transaction ${clientReferenceId}`,
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
  else if (event.type === "charge.refunded") {
    const charge = event.data.object;
    // Assume the charge metadata contains the client_reference_id set during Checkout Session creation
    const clientReferenceId = charge.metadata && charge.metadata.client_reference_id;
    if (!clientReferenceId) {
      console.error("No client reference id found in charge metadata for refund");
      return res.status(400).json({ error: "Missing client reference id" });
    }
    const transactionId = charge.id;
    const amountRefunded = charge.amount_refunded / 100; // Convert cents to dollars
    const currency = charge.currency;
    // Use billing_details.email if available
    const receiptEmail = charge.billing_details ? charge.billing_details.email : null;
    const paymentMethod = charge.payment_method_details
      ? charge.payment_method_details.type
      : "unknown";
    const paymentStatus = "refunded";

    let dbConnection;
    try {
      dbConnection = await connection.getConnection();
      await dbConnection.beginTransaction();

      // Get PR Data for the Transaction
      const [prData] = await dbConnection.query(
        "SELECT id, user_id FROM pr_data WHERE client_id = ?",
        [clientReferenceId]
      );

      if (!prData.length) {
        throw new Error("PR data not found for this refund transaction.");
      }

      const prId = prData[0].id;
      const userId = prData[0].user_id;

      // Update PR Status to "refunded"
      await dbConnection.query(
        "UPDATE pr_data SET payment_status = 'refunded' WHERE id = ?",
        [prId]
      );

      // Insert Refund Record into `payment_history`
      await dbConnection.query(
        "INSERT INTO payment_history (pr_id, user_id, stripe_session_id, transaction_id, amount, currency, payment_status, payment_method, receipt_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          prId,
          userId,
          null, // Not applicable for refunds (or use charge.id if desired)
          transactionId,
          amountRefunded,
          currency,
          "refunded",
          paymentMethod,
          receiptEmail,
        ]
      );

      // Add notification for refund
      await dbConnection.query(
        "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
        [
          userId,
          "Payment Refunded",
          `Your PR Order #${prId} payment of $${amountRefunded} has been refunded.`,
        ]
      );

      await dbConnection.commit();

      // Send Email to Customer about the refund
      const refundMailOptions = {
        from: "IMCWire <Orders@imcwire.com>",
        to: receiptEmail,
        subject: `Your Payment Has Been Refunded - PR# ${prId} Transaction ${clientReferenceId}`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Refunded - IMCWire</title>
          </head>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
              <h2 style="text-align: center; color: #333;">Your Payment Has Been Refunded</h2>
              <p>Dear ${receiptEmail},</p>
              <p>Your payment for PR Order #${prId} has been refunded.</p>
              <ul>
                <li><strong>Refunded Amount:</strong> $${amountRefunded}</li>
              </ul>
              <p>If you have any questions, please contact our support team.</p>
              <p>Warm regards,<br>The IMCWire Team</p>
            </div>
          </body>
          </html>
        `,
      };
      await transporter.sendMail(refundMailOptions);

      // Send Email to Admin about the refund
      const adminEmails = [
        "admin@imcwire.com",
        "imcwirenotifications@gmail.com",
      ];
      const adminRefundMailOptions = {
        from: "IMCWire <Orders@imcwire.com>",
        to: adminEmails.join(","),
        subject: `Payment Refunded - PR# ${prId} Transaction ${clientReferenceId}`,
        html: `
          <p>Refund processed:</p>
          <ul>
            <li><strong>Transaction ID:</strong> ${transactionId}</li>
            <li><strong>Refunded Amount:</strong> $${amountRefunded} ${currency.toUpperCase()}</li>
            <li><strong>Payment Method:</strong> ${paymentMethod}</li>
            <li><strong>User Email:</strong> ${receiptEmail}</li>
          </ul>
        `,
      };
      await transporter.sendMail(adminRefundMailOptions);

      return res.status(200).json({ received: true });
    } catch (error) {
      if (dbConnection) {
        await dbConnection.rollback();
      }
      console.error("Error processing refund:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (dbConnection) {
        dbConnection.release();
      }
    }
  }

  // Only send this response if no previous response was sent
  return res.status(200).send("Webhook received");
};



