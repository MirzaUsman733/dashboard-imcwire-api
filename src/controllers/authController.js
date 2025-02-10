const connection = require("../config/dbconfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { transporter } = require("../config/transporter");
require("dotenv").config();
// Helper functions for AES encryption and decryption
// Helper functions for AES encryption and decryption
function encryptPassword(password) {
  if (!password) {
    throw new Error("Password is required for encryption");
  }
  const algorithm = "aes-128-cbc";
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, "salt", 16); // Ensure the key is 16 bytes for AES-128
  const iv = crypto.randomBytes(16); // Initialization vector

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");

  return { encrypted, iv: iv.toString("hex") };
}

function decryptPassword(encryptedWithIV) {
  try {
    const [encrypted, ivHex] = encryptedWithIV.split(":");
    const algorithm = "aes-128-cbc";
    const key = crypto.scryptSync(
      process.env.ENCRYPTION_KEY || "default_key",
      "salt",
      16
    );
    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return null; // or handle error appropriately
  }
}

// Register a new user with role
exports.registerUser = async (req, res) => {
  const { username, email, password, role, isAgency } = req.body;
  let dbConnection;

  try {
    dbConnection = await connection.getConnection();
    console.log("Database connection successfully established.");
    await dbConnection.beginTransaction();
    console.log("Transaction started.");

    const [existingUser] = await dbConnection.query(
      "SELECT * FROM auth_user WHERE email = ?",
      [email]
    );
    console.log("Checked for existing user:", existingUser);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    console.log("Password hashed.");
    const { encrypted, iv } = encryptPassword(password); // Check this function's existence and correctness

    const [result] = await dbConnection.query(
      "INSERT INTO auth_user (username, email, password, aes_password, role, isAgency, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        username,
        email,
        password_hash,
        `${encrypted}:${iv}`, // Correct the column name if necessary
        role || "user",
        isAgency || false,
        "active",
      ]
    );
    console.log("User inserted into database:", result);

    await dbConnection.commit();
    console.log("Transaction committed.");
    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    if (dbConnection) await dbConnection.rollback();
    res.status(500).json({ error: "Error registering user" });
  } finally {
    if (dbConnection) dbConnection.release();
    console.log("Database connection released.");
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password, ipAddress } = req.body;

  try {
    const [results] = await connection.query(
      "SELECT * FROM auth_user WHERE email = ?",
      [email]
    );
    const user = results[0];

    if (!user) {
      return res.status(400).json({ message: "Email or Password is Invalid" });
    }

    // Blocked or Deleted Check
    if (user.status === "permanent_block") {
      return res
        .status(403)
        .json({ message: "Your account is permanently blocked." });
    }
    if (user.status === "temporary_block") {
      return res.status(403).json({
        message: "Your account is temporarily blocked. Contact support.",
      });
    }
    if (user.status === "deleted") {
      return res
        .status(403)
        .json({ message: "Your account has been deleted." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Email or Password is Invalid" });
    }

    const token = jwt.sign(
      {
        id: user.auth_user_id,
        email: user.email,
        role: user.role,
        isAgency: user.isAgency,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // Store login history
    await connection.query(
      "INSERT INTO login_history (user_id, email, ip_address) VALUES (?, ?, ?)",
      [user.auth_user_id, user.email, ipAddress]
    );

    res.status(200).json({
      message: "Login successful",
      token,
      name: user.username,
      email: user.email,
      role: user.role,
      isAgency: user.isAgency === 0 ? false : true,
      status: user.status,
      isActive: true,
    });
  } catch (error) {
    res.status(500).json({ error: "Error logging in user" });
  }
};

// Forgot Password (Generate Reset Token)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const [users] = await connection.query(
      "SELECT * FROM auth_user WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    // Generate Secure Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date();
    resetTokenExpires.setMinutes(resetTokenExpires.getMinutes() + 30); // 30 mins expiry

    // Save token and expiration in the database
    await connection.query(
      "UPDATE auth_user SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
      [resetToken, resetTokenExpires, email]
    );

    // Password Reset URL (Replace with your frontend URL)
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;

    // Email Content
    const mailOptions = {
      from: `"IMCWire Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request - IMCWire",
      html: `
        <h2>Password Reset Request</h2>
        <p>Dear ${user.username},</p>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 30 minutes. If you did not request this, please ignore this email.</p>
        <p>Best Regards,<br>IMCWire Support Team</p>
      `,
    };

    // Send Email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message:
        "Password reset email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    res.status(500).json({ error: "Error processing password reset request" });
  }
};

// Reset Password (Verify Token and Update Password)
exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    const [users] = await connection.query(
      "SELECT * FROM auth_user WHERE email = ? AND reset_token = ?",
      [email, token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = users[0];

    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ message: "Token expired" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await connection.query(
      "UPDATE auth_user SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE email = ?",
      [hashedPassword, email]
    );

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: "Error resetting password" });
  }
};

// ✅ **Superadmin-Only API to Change Role & Status**
exports.superadminUpdateUser = async (req, res) => {
  const { targetUserId, role, status } = req.body;
  const updates = {};
  let statusChanged = false;

  try {
    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    // Fetch the target user details
    const [targetUsers] = await connection.query(
      "SELECT * FROM auth_user WHERE auth_user_id = ?",
      [targetUserId]
    );

    const targetUser = targetUsers[0];

    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // Only allow superadmin to change role and status
    if (role) {
      updates.role = role;
    }

    if (
      status &&
      ["active", "temporary_block", "permanent_block", "deleted"].includes(
        status
      )
    ) {
      statusChanged = true;
      updates.status = status;
    }

    // If no valid fields provided, return error
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    // Construct query dynamically
    const queryParts = Object.keys(updates).map((key) => `${key} = ?`);
    const values = Object.values(updates);
    values.push(targetUserId);

    // Update the user in the database
    await connection.query(
      `UPDATE auth_user SET ${queryParts.join(", ")} WHERE auth_user_id = ?`,
      values
    );

    // Notify the user if status changes
    if (statusChanged) {
      const adminEmails = [
        "imcwirenotifications@gmail.com",
        "admin@imcwire.com",
      ];
      let mailOptions = {};
      let adminMailOptions = {};

      // Construct user notification email
      switch (status) {
        case "permanent_block":
          mailOptions = {
            from: `"IMCWire Support" <${process.env.SMTP_USER}>`,
            to: targetUser.email,
            subject: "Important Account Notification",
            html: `
             <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Permanent Account Suspension Notice</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">

    <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        
        <h2 style="color: #d9534f;">Dear ${targetUser.username},</h2>
        
        <p>We regret to inform you that your <strong>IMCWire</strong> account has been <strong>permanently blocked</strong> due to violations of our <a href="https://imcwire.com/terms-of-service/" target="_blank">Terms of Service</a>.</p>

        <h3 style="color: #333;">Implications of This Action:</h3>
        <ul>
            <li><strong>Immediate Loss of Access:</strong> Your access to all IMCWire services has been revoked permanently.</li>
            <li><strong>Termination of Services:</strong> Any active subscriptions, pending orders, or associated services have been canceled.</li>
            <li><strong>Final Decision:</strong> This action is irreversible and binding.</li>
        </ul>

        <h3 style="color: #333;">Possible Reasons for This Action:</h3>
        <ul>
            <li>Repeated violations of IMCWire’s <a href="https://imcwire.com/guidelines/" target="_blank">content policies</a>.</li>
            <li>Unauthorized activities, fraudulent transactions, or misuse of the platform.</li>
            <li>Attempts to distribute misleading, false, or harmful content.</li>
            <li>Violation of copyright, trademarks, or intellectual property rights.</li>
            <li>Excessive spamming, abuse, or exploitation of system resources.</li>
            <li>Engaging in illegal or unethical activities through our platform.</li>
        </ul>

        <p>If you believe this action was taken in error or require further clarification, you may contact our support team at <a href="mailto:support@imcwire.com">support@imcwire.com</a>.</p>

        <p>We appreciate your cooperation and compliance with our platform policies.</p>

        <p><strong>Best Regards,</strong><br>IMCWire Support Team</p>

        <p style="font-size: 12px; color: #777;">This is an automated message; please do not reply to this email. If you need assistance, contact our support team.</p>
    
    </div>

</body>
</html>
            `,
          };
          break;

        case "temporary_block":
          mailOptions = {
            from: `"IMCWire Support" <${process.env.SMTP_USER}>`,
            to: targetUser.email,
            subject: "Temporary Suspension of Your IMCWire Account",
            html: `
             <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Temporary Suspension Notice</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">

    <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        
        <h2 style="color: #d9534f;">Dear ${targetUser.username},</h2>
        
        <p>We regret to inform you that your <strong>IMCWire</strong> account has been temporarily suspended due to a violation of our platform policies.</p>

        <h3 style="color: #333;">Impact of Suspension:</h3>
        <ul>
            <li><strong>Restricted Access:</strong> You cannot access your IMCWire account during the suspension period.</li>
            <li><strong>Service Limitation:</strong> All active submissions and pending press releases are temporarily on hold.</li>
            <li><strong>Automatic Reinstatement:</strong> Your account will be automatically reinstated after the suspension period ends.</li>
        </ul>

        <h3 style="color: #333;">Possible Reasons for Suspension:</h3>
        <ul>
            <li>Violation of our <a href="https://imcwire.com/guidelines/" target="_blank">content guidelines</a>.</li>
            <li>Multiple failed or unauthorized press release submissions.</li>
            <li>Suspected fraudulent activity or policy abuse.</li>
            <li>Excessive spamming or misusing the platform.</li>
            <li>Unauthorized attempts to bypass system security.</li>
        </ul>

        <p>For more details, please review our <a href="https://imcwire.com/guidelines/" target="_blank">IMCWire Guidelines</a>.</p>

        <p>If you believe this suspension was a mistake or require further clarification, please contact our support team at <a href="mailto:support@imcwire.com">support@imcwire.com</a>.</p>

        <p>We appreciate your cooperation in maintaining the integrity of our platform.</p>

        <p><strong>Best Regards,</strong><br>IMCWire Support Team</p>

        <p style="font-size: 12px; color: #777;">This is an automated message; please do not reply to this email. If you need assistance, contact our support team.</p>
    
    </div>

</body>
</html>

            `,
          };
          break;

        case "active":
          mailOptions = {
            from: `"IMCWire Support" <${process.env.SMTP_USER}>`,
            to: targetUser.email,
            subject: "User Activated on IMCWire Account",
            html: `
             <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Reactivation Notice</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">

    <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        
        <h2 style="color: #28a745;">Dear ${targetUser.username},</h2>
        
        <p>We are pleased to inform you that your <strong>IMCWire</strong> account has been successfully reactivated.</p>

        <p>You can now log in and resume accessing all our services, including press release submissions, media distributions, and tracking analytics.</p>

        <h3 style="color: #333;">What You Can Do Next:</h3>
        <ul>
            <li><strong>Access Your Dashboard:</strong> Manage your press releases and track your distributions.</li>
            <li><strong>Schedule New Releases:</strong> Start publishing content again.</li>
            <li><strong>Reach Out to Support:</strong> If you need any assistance, feel free to contact us.</li>
        </ul>

        <p>For any concerns or support inquiries, you can reach out to us at <a href="mailto:support@imcwire.com">support@imcwire.com</a>.</p>

        <p><strong>Best Regards,</strong><br>IMCWire Support Team</p>

        <p style="font-size: 12px; color: #777;">This is an automated message; please do not reply to this email. If you need assistance, contact our support team.</p>
    
    </div>

</body>
</html>

            `,
          };
          break;

        case "deleted":
          mailOptions = {
            from: `"IMCWire Support" <${process.env.SMTP_USER}>`,
            to: targetUser.email,
            subject: "Account Deletion Notification",
            html: `
             <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Termination Notice</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">

    <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        
        <h2 style="color: #d9534f;">Dear ${targetUser.username},</h2>
        
        <p>We regret to inform you that your IMCWire account has been permanently deleted due to a violation of our <strong>Terms of Service and Policies</strong>. Our system has detected activity that does not comply with our guidelines, leading to this necessary action.</p>

        <h3 style="color: #333;">Possible Reasons for Account Termination:</h3>
        <ul>
            <li>Unauthorized press release submissions or content manipulation.</li>
            <li>Violation of copyright, trademarks, or intellectual property laws.</li>
            <li>Submission of misleading or fraudulent information.</li>
            <li>Abuse of our services, including spamming or excessive submissions.</li>
            <li>Engagement in illegal, unethical, or harmful activities.</li>
            <li>Use of false identities or misrepresentation of credentials.</li>
            <li>Attempting to bypass platform security or abuse system loopholes.</li>
        </ul>

        <p>If you believe this action was taken in error or require further clarification, you may contact our support team within <strong>7 days</strong> at <a href="mailto:support@imcwire.com">support@imcwire.com</a>. However, please note that account reinstatement is subject to a thorough review and is not guaranteed.</p>

        <p>We appreciate your understanding and compliance with our platform's policies.</p>

        <p><strong>Best Regards,</strong><br>IMCWire Support Team</p>

        <p style="font-size: 12px; color: #777;">This is an automated message; please do not reply to this email. If you need assistance, contact our support team.</p>
    
    </div>

</body>
</html>

            `,
          };
          break;
      }

      // Construct admin notification email
      adminMailOptions = {
        from: `"IMCWire Support" <${process.env.SMTP_USER}>`,
        to: adminEmails.join(","),
        subject: "Account Status Update",
        html: `
          <h3>Account Status Update</h3>
          <p>Dear Admins,</p>
          <p>The account status of user <strong>${targetUser.username}</strong> (<a href="mailto:${targetUser.email}">${targetUser.email}</a>) has been updated.</p>
          <ul>
            <li><strong>User ID:</strong> ${targetUser.auth_user_id}</li>
            <li><strong>New Status:</strong> ${status}</li>
          </ul>
          <p>Please take necessary actions as per the updated status.</p>
        `,
      };

      // Send notification emails
      await transporter.sendMail(mailOptions);
      await transporter.sendMail(adminMailOptions);
    }

    return res.status(200).json({
      message: "User role/status updated successfully",
      updates,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Error updating user role/status", error });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.user;
  const {
    username,
    currentPassword,
    newPassword,
    isAgency,
    full_name,
    image_url,
    street_address,
    city,
    country,
    zip_code,
    phone_number,
    gender,
    date_of_birth,
  } = req.body;

  const userUpdates = {};
  const profileUpdates = {};

  let dbConnection;

  try {
    dbConnection = await connection.getConnection(); // Get a DB connection from the pool
    await dbConnection.beginTransaction(); // Start a transaction

    // Fetch user from auth_user
    const [users] = await dbConnection.query(
      "SELECT * FROM auth_user WHERE auth_user_id = ?",
      [id]
    );
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update username
    if (username) {
      userUpdates.username = username;
    }

    // Update password (requires current password)
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required to update the password",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      userUpdates.password = await bcrypt.hash(newPassword, salt);
    }

    // Update isAgency status
    if (isAgency !== undefined) {
      userUpdates.isAgency = isAgency;
    }

    // Update user details in auth_user if any changes exist
    if (Object.keys(userUpdates).length > 0) {
      const query = Object.keys(userUpdates)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(userUpdates);
      values.push(id);

      await dbConnection.query(
        `UPDATE auth_user SET ${query} WHERE auth_user_id = ?`,
        values
      );
    }

    // Check if user profile exists
    const [profile] = await dbConnection.query(
      "SELECT * FROM user_profile WHERE user_id = ?",
      [id]
    );

    // Prepare profile updates
    if (full_name) profileUpdates.full_name = full_name;
    if (image_url) profileUpdates.image_url = image_url;
    if (street_address) profileUpdates.street_address = street_address;
    if (city) profileUpdates.city = city;
    if (country) profileUpdates.country = country;
    if (zip_code) profileUpdates.zip_code = zip_code;
    if (phone_number) profileUpdates.phone_number = phone_number;
    if (gender) profileUpdates.gender = gender;
    if (date_of_birth) profileUpdates.date_of_birth = date_of_birth;

    if (profile.length > 0) {
      // Update existing profile
      if (Object.keys(profileUpdates).length > 0) {
        const profileQuery = Object.keys(profileUpdates)
          .map((key) => `${key} = ?`)
          .join(", ");
        const profileValues = Object.values(profileUpdates);
        profileValues.push(id);

        await dbConnection.query(
          `UPDATE user_profile SET ${profileQuery} WHERE user_id = ?`,
          profileValues
        );
      }
    } else {
      // Create a new profile if it doesn't exist
      if (Object.keys(profileUpdates).length > 0) {
        await dbConnection.query(
          `INSERT INTO user_profile (user_id, full_name, image_url, street_address, city, country, zip_code, phone_number, gender, date_of_birth)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

          [
            id,
            full_name || null,
            image_url || null,
            street_address || null,
            city || null,
            country || null,
            zip_code || null,
            phone_number || null,
            gender || null,
            date_of_birth || null,
          ]
        );
      }
    }

    // Commit transaction after all operations are successful
    await dbConnection.commit();

    // Send Email Notification for Password Change
    if (newPassword) {
      const mailOptions = {
        from: `"IMCWire Support" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Your Password Has Been Changed - IMCWire",
        html: `
          <h2>Password Changed Successfully</h2>
          <p>Dear ${user.username},</p>
          <p>Your password has been successfully updated. If you did not request this change, please contact our support team immediately.</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p>For security reasons, we recommend updating your password regularly.</p>
          <p>Best Regards,<br>IMCWire Support Team</p>
        `,
      };
      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({
      message: "User and profile updated successfully",
      userUpdates,
      profileUpdates,
    });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback(); // Rollback changes if error occurs
    res
      .status(500)
      .json({ error: "Error updating user", details: error.message });
  } finally {
    if (dbConnection) dbConnection.release(); // Release connection back to pool
  }
};

// ✅ Add User Profile API
exports.addUserProfile = async (req, res) => {
  const { id } = req.user;
  const {
    full_name,
    image_url,
    street_address,
    city,
    country,
    zip_code,
    phone_number,
    gender,
    date_of_birth,
  } = req.body;

  try {
    // Check if profile already exists
    const [profile] = await connection.query(
      "SELECT * FROM user_profile WHERE user_id = ?",
      [id]
    );

    if (profile.length > 0) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    // Insert new profile
    await connection.query(
      `INSERT INTO user_profile (user_id, full_name, image_url, street_address, city, country, zip_code, phone_number, gender, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        full_name,
        image_url,
        street_address,
        city,
        country,
        zip_code,
        phone_number,
        gender,
        date_of_birth,
      ]
    );

    res.status(201).json({ message: "Profile added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding profile" });
  }
};

// ✅ Get User Profile API
exports.getUserProfile = async (req, res) => {
  const { id } = req.user;

  try {
    // Get user info from auth_user
    const [userResults] = await connection.query(
      "SELECT username, email, isAgency FROM auth_user WHERE auth_user_id = ?",
      [id]
    );
    const user = userResults[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user profile info from user_profile
    const [profileResults] = await connection.query(
      "SELECT * FROM user_profile WHERE user_id = ?",
      [id]
    );
    const profile = profileResults[0] || {};

    // Combine both user data and profile data
    const userData = {
      username: user.username,
      email: user.email,
      isAgency: user.isAgency === 0 ? false : true,
      profile,
    };

    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user profile" });
  }
};

// ✅ SuperAdmin - Get All Users API
// exports.getAllUsers = async (req, res) => {
//   try {
//     // Fetch all users from auth_user table
//     const [users] = await connection.query(
//       `SELECT
//         auth_user_id, username, email, role, isAgency, status, created_at
//       FROM auth_user`
//     );

//     // Fetch user profiles
//     const [profiles] = await connection.query(`SELECT * FROM user_profile`);

//     // Create a user dictionary for easy mapping
//     const profileMap = {};
//     profiles.forEach((profile) => {
//       profileMap[profile.user_id] = profile;
//     });

//     // Combine user data with profiles
//     const allUsers = users.map((user) => ({
//       id: user.auth_user_id,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//       isAgency: user.isAgency === 0 ? false : true,
//       status: user.status,
//       createdAt: user.created_at,
//       profile: profileMap[user.auth_user_id] || null, // Attach profile if exists
//     }));

//     res
//       .status(200)
//       .json({ message: "Users retrieved successfully", users: allUsers });
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching users" });
//   }
// };

exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users from auth_user table
    const [users] = await connection.query(
      `SELECT 
        auth_user_id, username, email, role, isAgency, status, created_at, aes_password
      FROM auth_user
      ORDER BY auth_user_id DESC`
    );

    // Fetch user profiles
    const [profiles] = await connection.query(`SELECT * FROM user_profile`);

    // Create a user dictionary for easy mapping
    const profileMap = {};
    profiles.forEach((profile) => {
      profileMap[profile.user_id] = profile;
    });

    // Decrypt each user's password and combine user data with profiles
    const allUsers = users.map((user) => {
      // Decrypt password
      const decryptedPassword = user.aes_password
        ? decryptPassword(user.aes_password)
        : null;

      return {
        id: user.auth_user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAgency: user.isAgency === 0 ? false : true,
        status: user.status,
        createdAt: user.created_at,
        decryptedPassword, // Decrypted password added
        profile: profileMap[user.auth_user_id] || null, // Attach profile if exists
      };
    });

    res
      .status(200)
      .json({ message: "Users retrieved successfully", users: allUsers });
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
};

// ✅ SuperAdmin - Get Single User Profile API
exports.getSingleUserProfile = async (req, res) => {
  const { userId } = req.params; // Extract user ID from request params

  try {
    // Fetch user info from auth_user
    const [userResults] = await connection.query(
      "SELECT auth_user_id, username, email, role, isAgency, status, created_at FROM auth_user WHERE auth_user_id = ?",
      [userId]
    );

    if (userResults.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResults[0];

    // Fetch user profile from user_profile table
    const [profileResults] = await connection.query(
      "SELECT * FROM user_profile WHERE user_id = ?",
      [userId]
    );

    const profile = profileResults[0] || null;

    // Construct user response
    const userProfile = {
      id: user.auth_user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAgency: user.isAgency === 0 ? false : true,
      status: user.status,
      createdAt: user.created_at,
      profile, // Attach user profile if exists
    };

    res.status(200).json({
      message: "User profile retrieved successfully",
      user: userProfile,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user profile" });
  }
};
