const connection = require("../config/dbconfig");

// ✅ **Create a new coupon (Admin Only)**
exports.createCoupon = async (req, res) => {
  try {
    const {
      couponCode,
      discountPercentage,
      plan_id,
      usageLimit,
      expirationDate,
    } = req.body;

    if (!couponCode || !discountPercentage) {
      return res
        .status(400)
        .json({ message: "Coupon code and discount percentage are required" });
    }

    const dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction();

    // ✅ **Check if `plan_id` exists in `plan_data`**
    if (plan_id) {
      const [planCheck] = await dbConnection.query(
        "SELECT id FROM plan_items WHERE id = ?",
        [plan_id]
      );

      if (planCheck.length === 0) {
        await dbConnection.rollback();
        return res
          .status(404)
          .json({ message: "Plan not found. Please provide a valid plan_id." });
      }
    }

    // ✅ **Insert Coupon**
    const [result] = await dbConnection.query(
      "INSERT INTO coupons (couponCode, discountPercentage, plan_id, usageLimit, expirationDate) VALUES (?, ?, ?, ?, ?)",
      [
        couponCode,
        discountPercentage,
        plan_id || null,
        usageLimit || 0,
        expirationDate || null,
      ]
    );

    await dbConnection.commit();
    dbConnection.release();

    res.status(201).json({
      message: "Coupon created successfully",
      couponId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: error.sqlMessage || error.message,
      });
  }
};

// ✅ **Update an existing coupon (Admin Only)**
exports.updateCoupon = async (req, res) => {
  try {
    const { id, ...updatedData } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Coupon ID is required" });
    }

    const queryParts = [];
    const values = [];

    Object.keys(updatedData).forEach((key) => {
      queryParts.push(`${key} = ?`);
      values.push(updatedData[key]);
    });

    values.push(id);

    await connection.query(
      `UPDATE coupons SET ${queryParts.join(", ")} WHERE id = ?`,
      values
    );

    res.status(200).json({ message: "Coupon updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ **Get All Coupons (Superadmin Only)**
exports.getAllCoupons = async (req, res) => {
  try {
    const [coupons] = await connection.query(
      "SELECT * FROM coupons ORDER BY created_at DESC"
    );
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ **Get Active Coupons (Users Only)**
exports.getUserCoupons = async (req, res) => {
  try {
    const [coupons] = await connection.query(
      "SELECT * FROM coupons WHERE status = 'active' ORDER BY created_at DESC"
    );
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ **Validate a Coupon Code**
exports.validateCoupon = async (req, res) => {
  try {
    const { couponCode } = req.query;

    if (!couponCode) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const [coupons] = await connection.query(
      "SELECT * FROM coupons WHERE couponCode = ?",
      [couponCode]
    );
    const coupon = coupons[0];

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Check expiration and usage limit
    const currentTime = new Date();
    if (
      coupon.expirationDate &&
      new Date(coupon.expirationDate) < currentTime
    ) {
      return res.status(400).json({ message: "Coupon has expired" });
    }
    if (coupon.usageLimit > 0 && coupon.timesUsed >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    res.status(200).json({
      message: "Coupon is valid",
      discountPercentage: coupon.discountPercentage,
      status: coupon.status,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ **Delete a coupon (Admin Only)**
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Coupon ID is required" });
    }

    await connection.query("DELETE FROM coupons WHERE id = ?", [id]);

    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
