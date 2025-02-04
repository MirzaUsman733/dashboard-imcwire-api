const connection = require("../config/dbconfig");
const { v4: uuidv4 } = require("uuid");
const { transporter } = require("../config/transporter");
require("dotenv").config();

// Utility function to sanitize the name: remove any characters that are not letters or spaces
const sanitizeName = (name) => {
  return name.replace(/[^a-zA-Z\s]/g, "");
};

// exports.createOrder = async (req, res) => {
//   try {
//     let { name, email, totalPrice, address } = req.body;

//     // Sanitize the user's name to remove special characters and numbers
//     name = sanitizeName(name);

//     // Generate a unique client ID on the server side
//     const clientId = uuidv4();
//     // Authenticate and get the token
//     const authResponse = await fetch(`${process.env.Paypro_URL}/v2/ppro/auth`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         clientid: process.env.clientid,
//         clientsecret: process.env.clientsecret,
//       }),
//     });
//     console.log(authResponse);
//     if (!authResponse.ok) {
//       return res.status(401).json({ message: "Authentication failed" });
//     }
//     const authResult = await authResponse.text();
//     const token = authResponse.headers.get("Token");
//     if (authResult === "Authorized" || !token) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const issueDate = new Date();
//     const orderDueDate = new Date(issueDate);
//     orderDueDate.setDate(issueDate.getDate() + 1);
//     const formattedIssueDate = issueDate.toISOString().split("T")[0];
//     const formattedOrderDueDate = orderDueDate.toISOString().split("T")[0];
//     const orderPayload = [
//       { MerchantId: "NUXLAY" },
//       {
//         OrderNumber: clientId,
//         CurrencyAmount: `${totalPrice}.00`,
//         Currency: "USD",
//         OrderDueDate: formattedOrderDueDate,
//         OrderType: "Service",
//         IsConverted: "true",
//         IssueDate: formattedIssueDate,
//         OrderExpireAfterSeconds: "0",
//         CustomerName: name,
//         CustomerMobile: "",
//         CustomerEmail: email,
//         CustomerAddress: address,
//       },
//     ];
//     console.log(orderPayload);
//     // Create order using the token
//     const orderResponse = await fetch(`${process.env.Paypro_URL}/v2/ppro/co`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Token: token,
//       },
//       body: JSON.stringify(orderPayload),
//     });
//     console.log(orderResponse);
//     const result = await orderResponse.json();
//     console.log("Result :", result);
//     if (orderResponse.ok && result[0]?.Status === "00") {
//       const click2PayUrl = result[1]?.Click2Pay;
//       if (click2PayUrl) {
//         const finalUrl = `${click2PayUrl}&callback_url=https://dashboard.imcwire.com/thankyou`;
//         return res.json({ finalUrl });
//       } else {
//         return res.status(500).json({ message: "Click2Pay URL not found" });
//       }
//     } else {
//       return res.status(500).json({ message: "Order creation failed" });
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

exports.createOrder = async (req, res) => {
  let dbConnection;

  try {
    let { name, email, totalPrice, address } = req.body;

    if (!name || !email || !totalPrice || !address) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Sanitize the user's name to remove special characters and numbers
    name = sanitizeName(name);

    // Generate a unique client ID on the server side
    const clientId = uuidv4();

    dbConnection = await connection.getConnection(); // Get a DB connection from the pool
    await dbConnection.beginTransaction(); // Start a transaction

    // ✅ **Authenticate and get the token**
    const authResponse = await fetch(`${process.env.Paypro_URL}/v2/ppro/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientid: process.env.clientid,
        clientsecret: process.env.clientsecret,
      }),
    });

    if (!authResponse.ok) {
      await dbConnection.rollback();
      return res.status(401).json({ message: "Authentication failed" });
    }

    const token = authResponse.headers.get("Token");
    if (!token) {
      await dbConnection.rollback();
      return res
        .status(401)
        .json({ message: "Unauthorized: Token not received." });
    }

    const issueDate = new Date();
    const orderDueDate = new Date(issueDate);
    orderDueDate.setDate(issueDate.getDate() + 1);

    const formattedIssueDate = issueDate.toISOString().split("T")[0];
    const formattedOrderDueDate = orderDueDate.toISOString().split("T")[0];

    const orderPayload = [
      { MerchantId: "NUXLAY" },
      {
        OrderNumber: clientId,
        CurrencyAmount: `${totalPrice}.00`,
        Currency: "USD",
        OrderDueDate: formattedOrderDueDate,
        OrderType: "Service",
        IsConverted: "true",
        IssueDate: formattedIssueDate,
        OrderExpireAfterSeconds: "0",
        CustomerName: name,
        CustomerMobile: "",
        CustomerEmail: email,
        CustomerAddress: address,
      },
    ];

    // ✅ **Create Order using the Token**
    const orderResponse = await fetch(`${process.env.Paypro_URL}/v2/ppro/co`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: token,
      },
      body: JSON.stringify(orderPayload),
    });

    const result = await orderResponse.json();

    if (orderResponse.ok && result[0]?.Status === "00") {
      const click2PayUrl = result[1]?.Click2Pay;
      if (click2PayUrl) {
        const finalUrl = `${click2PayUrl}&callback_url=https://dashboard.imcwire.com/thankyou`;

        await dbConnection.commit();
        dbConnection.release();

        return res.json({ finalUrl });
      } else {
        await dbConnection.rollback();
        return res.status(500).json({ message: "Click2Pay URL not found" });
      }
    } else {
      await dbConnection.rollback();
      return res.status(500).json({ message: "Order creation failed" });
    }
  } catch (error) {
    if (dbConnection) await dbConnection.rollback(); // Rollback if an error occurs
    if (dbConnection) dbConnection.release(); // Ensure the connection is released

    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getOrderStatus = async (req, res) => {
  try {
    const { id } = req.body;

    // Authenticate and get token
    const authResponse = await fetch(`${process.env.Paypro_URL}/v2/ppro/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientid: process.env.clientid,
        clientsecret: process.env.clientsecret,
      }),
    });

    if (!authResponse.ok) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const token = authResponse.headers.get("token");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get order status from PayPro
    const orderStatusResponse = await fetch(
      `https://api.paypro.com.pk/v2/ppro/ggos?userName=${encodeURIComponent(
        "NUXLAY"
      )}&cpayId=${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Token: token,
        },
      }
    );

    const orderResultData = await orderStatusResponse.json();
    const orderID = orderResultData.OrderNumber;

    if (orderResultData[0]?.Status === "00") {
      const orderStatus = orderResultData[1]?.OrderStatus;

      if (orderStatus === "PAID") {
        let dbConnection;
        try {
          dbConnection = await connection.getConnection();
          await dbConnection.beginTransaction();

          // ✅ Get PR Data for the Transaction
          const [prData] = await dbConnection.query(
            "SELECT id, user_id, client_id FROM pr_data WHERE client_id = ?",
            [orderID]
          );

          if (!prData.length) {
            throw new Error("PR data not found for this transaction.");
          }

          const prId = prData[0].id;
          const userId = prData[0].user_id;

          const [userResult] = await dbConnection.query(
            "SELECT username, email FROM auth_user WHERE auth_user_id = ?",
            [userId]
          );

          if (userResult.length === 0) {
            return res.status(404).json({ message: "User email not found." });
          }

          const userEmail = userResult[0].email;
          const username = userResult[0].username;
          if (orderStatus === "PAID") {
            // ✅ Update PR Status to "paid"
            await dbConnection.query(
              "UPDATE pr_data SET payment_status = 'paid' WHERE id = ?",
              [prId]
            );
            // ✅ 1. Fetch User Email from `auth_user`

            // ✅ Insert Payment Record into `payment_history`
            await dbConnection.query(
              "INSERT INTO payment_history (pr_id, user_id, transaction_id, amount, currency, payment_status, payment_method, receipt_email) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [
                prId,
                userId,
                orderID,
                orderResultData[1]?.OrderAmount,
                "USD",
                "paid",
                "PayPro",
                userEmail,
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

          await dbConnection.commit(); // ✅ Commit transaction

          // ✅ Send Email to Customer
          const mailOptions = {
            from: "IMCWire <Orders@imcwire.com>",
            to: userEmail, // Fetch actual user email from DB if available
            subject: `${username} Payment Has Been Successfully Processed - IMCWire`,
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
          
                      <p>Dear ${userEmail},</p>
          
                      <p>We are delighted to inform you that your payment has been successfully processed, and your subscription to IMCWire is now active. Welcome aboard!</p>
          
                      <p>Here's a quick recap of the plan you've chosen:</p>
          
                      <ul>
                          <li><strong>Total Amount Paid:</strong> $ ${orderResultData[1]?.OrderAmount}</li>
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
            subject: `Your Payment Has Been Successfully Processed - Transaction ${orderID}`,
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
          
                      <p>Dear ${userEmail},</p>
          
                      <p>We are delighted to inform you that your payment has been successfully processed, and your subscription to IMCWire is now active. Welcome aboard!</p>
          
                      <p>Here's a quick recap of the plan you've chosen:</p>
          
                      <ul>
                          <li><strong>Total Amount Paid:</strong> $ ${orderResultData[1]?.OrderAmount}</li>
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
          await transporter.sendMail(adminMailOptions);

          return res.status(200).json({
            status: 200,
            message: "Order is PAID",
            orderResultData,
          });
        } catch (error) {
          if (dbConnection) {
            await dbConnection.rollback();
          }
          return res.status(500).json({ message: "Internal Server Error" });
        } finally {
          if (dbConnection) {
            dbConnection.release();
          }
        }
      } else {
        return res.status(200).json({
          status: 200,
          message: "Order is NOT PAID yet",
          orderResultData,
        });
      }
    }

    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
