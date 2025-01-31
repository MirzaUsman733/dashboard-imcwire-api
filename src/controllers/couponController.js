const connection = require("../config/dbconfig");

// ✅ **Create a new coupon (Admin Only) with Lock Retry Mechanism**
exports.createCoupon = async (req, res) => {
  const MAX_RETRIES = 3; // Number of retry attempts
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const {
        couponCode,
        discountPercentage,
        plan_id,
        usageLimit,
        expirationDate,
      } = req.body;

      if (!couponCode || !discountPercentage) {
        return res.status(400).json({
          message: "Coupon code and discount percentage are required",
        });
      }

      const dbConnection = await connection.getConnection();

      // ✅ **Check if `plan_id` exists in `plan_items`**
      if (plan_id) {
        const [planCheck] = await dbConnection.query(
          "SELECT id FROM plan_items WHERE id = ?",
          [plan_id]
        );

        if (planCheck.length === 0) {
          await dbConnection.rollback();
          return res.status(404).json({
            message: "Plan not found. Please provide a valid plan_id.",
          });
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

      return res.status(201).json({
        message: "Coupon created successfully",
        couponId: result.insertId,
      });
    } catch (error) {

      if (error.code === "ER_LOCK_WAIT_TIMEOUT" && attempt < MAX_RETRIES - 1) {
        attempt++;
        continue; // Retry transaction
      }

      return res.status(500).json({
        message: "Internal Server Error",
        error: error.sqlMessage || error.message,
      });
    }
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
      "SELECT *, (usageLimit > 0 AND timesUsed >= usageLimit) as isUsageLimitReached, (expirationDate IS NOT NULL AND expirationDate < NOW()) as isExpired FROM coupons WHERE couponCode = ?",
      [couponCode]
    );
    const coupon = coupons[0];

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Check expiration and usage limit
    if (coupon.isExpired) {
      return res.status(400).json({ message: "Coupon has expired" });
    }
    if (coupon.isUsageLimitReached) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    res.status(200).json({
      message: "Coupon is valid",
      discountPercentage: coupon.discountPercentage,
      status: coupon.status,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ **Update Coupon Usage**
exports.updateCouponUsage = async (req, res) => {
  try {
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const [coupons] = await connection.query(
      "SELECT * FROM coupons WHERE couponCode = ? AND expirationDate > NOW() AND (usageLimit = 0 OR timesUsed < usageLimit)",
      [couponCode]
    );
    const coupon = coupons[0];

    if (!coupon) {
      return res
        .status(404)
        .json({ message: "Invalid coupon code or coupon conditions not met" });
    }

    // Update the timesUsed count
    const result = await connection.query(
      "UPDATE coupons SET timesUsed = timesUsed + 1 WHERE id = ?",
      [coupon.id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Failed to update coupon usage" });
    }

    res.status(200).json({ message: "Coupon usage updated successfully" });
  } catch (error) {
    if (connection)
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
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
