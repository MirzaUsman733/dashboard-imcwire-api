require("dotenv").config();

exports.createOrder = async (req, res) => {
  try {
    const { name, email, totalPrice, clientId, address } = req.body;

    // Authenticate and get the token
    const authResponse = await fetch(`${process.env.Paypro_URL}/v2/ppro/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientid: process.env.clientid,
        clientsecret: process.env.clientsecret,
      }),
    });

    if (!authResponse.ok) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const authResult = await authResponse.text();
    const token = authResponse.headers.get("Token");
    if (authResult === "Authorized" || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const issueDate = new Date();
    const orderDueDate = new Date(issueDate);
    orderDueDate.setDate(issueDate.getDate() + 1);

    const formattedIssueDate = issueDate.toISOString().split("T")[0];
    const formattedOrderDueDate = orderDueDate.toISOString().split("T")[0];

    const orderPayload = [
      { MerchantId: "Nux_lay" },
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

    // Create order using the token
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
        return res.json({ finalUrl });
      } else {
        return res.status(500).json({ message: "Click2Pay URL not found" });
      }
    } else {
      return res.status(500).json({ message: "Order creation failed" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



exports.getOrderStatus = async (req, res) => {
  try {
    const { id } = req.body; // Extract ID from request body

    // Authenticate and get the token
    const authResponse = await fetch("https://api.paypro.com.pk/v2/ppro/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientid: process.env.CLIENT_ID,
        clientsecret: process.env.CLIENT_SECRET,
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
      `https://api.paypro.com.pk/v2/ppro/ggos?userName=${encodeURIComponent("Nuxlay")}&cpayId=${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Token: token,
        },
      }
    );

    const orderResultData = await orderStatusResponse.json();

    if (orderResultData[0]?.Status === "00") {
      const orderStatus = orderResultData[1]?.OrderStatus;
      if (orderStatus === "PAID") {
        return res.status(200).json({
          status: 200,
          message: "Order is PAID",
          orderResultData,
        });
      } else {
        return res.status(200).json({
          status: 200,
          message: "Order is NOT PAID yet",
          orderResultData,
        });
      }
    }

    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
