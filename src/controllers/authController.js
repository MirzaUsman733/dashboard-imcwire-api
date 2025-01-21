// const connection = require("../config/dbconfig");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// // Register a new user
// exports.registerUser = async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     const [existingUser] = await connection.query(
//       "SELECT * FROM auth_user WHERE email = ?",
//       [email]
//     );
//     if (existingUser.length > 0) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const password_hash = await bcrypt.hash(password, salt);

//     const result = await connection.query(
//       "INSERT INTO auth_user (username, email, password) VALUES (?, ?, ?)",
//       [username, email, password_hash]
//     );

//     const userId = result[0].insertId;

//     const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.status(201).json({
//       message: "User registered successfully and logged in",
//       token,
//       name: username,
//       email,
//       isActive: true,
//       isTrue: true,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: "Error registering user",
//       isActive: false,
//       isTrue: false,
//     });
//   }
// };

// exports.loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const [results] = await connection.query(
//       "SELECT * FROM auth_user WHERE email = ?",
//       [email]
//     );
//     const user = results[0];

//     if (!user) {
//       return res.status(400).json({ message: "Email or Password is Invalid" });
//     }

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(400).json({ message: "Email or Password is Invalid" });
//     }

//     const token = jwt.sign(
//       { id: user.auth_user_id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       name: user.username,
//       email: user.email,
//       isActive: true,
//       isTrue: true,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: "Error logging in user",
//       isActive: false,
//       isTrue: false,
//     });
//   }
// };

// exports.updateUser = async (req, res) => {
//   const { id } = req.user;
//   const { username, password } = req.body;
//   const updates = {};
//   try {
//     if (username) {
//       updates.username = username;
//     }

//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       updates.password = await bcrypt.hash(password, salt);
//     }

//     const query = [];
//     const values = [];

//     Object.keys(updates).forEach((key) => {
//       query.push(`${key} = ?`);
//       values.push(updates[key]);
//     });

//     if (query.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "No valid fields provided for update" });
//     }

//     values.push(id);

//     await connection.query(
//       `UPDATE auth_user SET ${query.join(", ")} WHERE auth_user_id = ?`,
//       values
//     );

//     res.status(200).json({
//       message: "User updated successfully",
//       updates: updates,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: "Error updating user",
//     });
//   }
// };

const connection = require("../config/dbconfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
// Register a new user with role
exports.registerUser = async (req, res) => {
  const { username, email, password, role, isAgency } = req.body;

  try {
    const [existingUser] = await connection.query(
      "SELECT * FROM auth_user WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await connection.query(
      "INSERT INTO auth_user (username, email, password, role, isAgency, status) VALUES (?, ?, ?, ?, ?, ?)",
      [
        username,
        email,
        password_hash,
        role || "user",
        isAgency || false,
        "active",
      ]
    );

    const userId = result[0].insertId;

    const token = jwt.sign(
      { id: userId, email, role, isAgency },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    // Send Welcome Email
    //   const mailOptions = {
    //     from: `"IMCWire Support" <${process.env.SMTP_USER}>`,
    //     to: email,
    //     subject: "Welcome to IMCWire - Your Registration is Successful 🎉",
    //     html: `
    //   <h2>Welcome, ${username}!</h2>
    //   <p>Thank you for registering on IMCWire.</p>
    //   <p>Your account is now active, and you can start using our platform.</p>
    //   <p><strong>Email:</strong> ${email}</p>
    //   <p><strong>Role:</strong> ${role || "user"}</p>
    //   <p><strong>Agency:</strong> ${isAgency ? "Yes" : "No"}</p>
    //   <p>Click below to login:</p>
    //   <a href="https://yourfrontend.com/login" style="padding: 10px 20px; background: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Login Now</a>
    //   <p>We’re excited to have you on board! If you have any questions, feel free to reach out.</p>
    //   <p>Best Regards,<br>IMCWire Support Team</p>
    // `,
    //   };

    //   await transporter.sendMail(mailOptions);
    const mailOptions = {
      from: "IMCWire <Orders@imcwire.com>",
      to: email,
      subject: "Welcome to IMCWire",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to IMCWire</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">

        <div style="background-color: #fff; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333; font-weight: bold;">Dear ${username},</h2>
            <p>Welcome to the IMCWire family! We're thrilled to have you on board and eager to collaborate in amplifying your message globally.</p>
            <p>With a decade of expertise in press release distribution, IMCWire is dedicated to linking you with premier media outlets and organizations, ensuring your news reaches its target audience effectively. Our network boasts esteemed platforms such as Yahoo Finance, Bloomberg, MarketWatch, and over 350 other prominent news and media channels.</p>
            
            <h3 style="color: #333; font-weight: bold;">As a member, here's what you can anticipate:</h3>
            <ul>
                <li>Extensive Distribution: Your press releases will reach leading news outlets, maximizing visibility.</li>
                <li>Tailored Plans: Choose from our plans, and Corporate plans to suit your visibility and influence requirements.</li>
                <li>Professional Support: Our team is available to guide you every step of the way, from crafting your press release to analyzing its impact.</li>
            </ul>
            
            <h3 style="color: #333; font-weight: bold;">To kick-start your IMCWire experience, we suggest the following steps:</h3>
            <ol>
                <li>Explore Your Dashboard: Log in to your account to manage your press releases and track performance.</li>
                <li>Schedule Your First Release: Ready to go live? Submit your debut press release through your dashboard or contact our support team for assistance.</li>
                <li>Reach Out: Questions or need help? Our dedicated support team is just an email or phone call away.</li>
            </ol>
            
            <p><strong>Thank you for choosing IMCWire. We're honored to be part of your journey and committed to ensuring your voice resonates worldwide.</p>
            
            <p><strong>Let's make headlines together!</strong></p>
            <div class="display: flex; justify-content: space-between; ">
            <div>Warm regards,</div>
            <div>The IMCWire Team</div>
            </div>
          
        </div>

        </body>
        </html>
    `,
    };

    await transporter.sendMail(mailOptions);
    const adminEmails = ["admin@imcwire.com", "imcwirenotifications@gmail.com"];
    const adminMailOptions = {
      from: "IMCWire <Orders@imcwire.com>",
      to: adminEmails.join(","),
      subject: "New User Registration",
      text: `A new user has registered with email: ${email}`,
    };
    await transporter.sendMail(adminMailOptions);

    res.status(201).json({
      message: "User registered successfully",
      token,
      name: username,
      email,
      role: role || "user",
      isAgency: isAgency || false,
      status: "active",
      isActive: true,
    });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

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
      { expiresIn: "1h" }
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
    console.error("Error sending reset email:", error);
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

// Update User API with Status Change Notifications
exports.updateUser = async (req, res) => {
  const { id } = req.user;
  const { username, currentPassword, newPassword, isAgency } = req.body;
  const updates = {};

  try {
    // Fetch the current user data
    const [users] = await connection.query(
      "SELECT * FROM auth_user WHERE auth_user_id = ?",
      [id]
    );
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update username
    if (username) {
      updates.username = username;
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
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    // Update Agency Status
    if (isAgency !== undefined) {
      updates.isAgency = isAgency;
    }

    // Update Status (Admin Only)
    // let statusChanged = false;
    // if (
    //   status &&
    //   ["active", "temporary_block", "permanent_block", "deleted"].includes(
    //     status
    //   )
    // ) {
    //   if (user.status !== status) {
    //     statusChanged = true;
    //     updates.status = status;
    //   }
    // }

    // If no updates, return an error
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    // Prepare SQL Query
    const query = [];
    const values = [];

    Object.keys(updates).forEach((key) => {
      query.push(`${key} = ?`);
      values.push(updates[key]);
    });

    values.push(id);

    // Execute Update Query
    await connection.query(
      `UPDATE auth_user SET ${query.join(", ")} WHERE auth_user_id = ?`,
      values
    );
    if (updates.password) {
      delete updates.password;
    }
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

    // Send Email Notification for Status Change

    res.status(200).json({
      message: "User updated successfully",
      updates,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error updating user" });
  }
};

// ✅ **Superadmin-Only API to Change Role & Status**
exports.superadminUpdateUser = async (req, res) => {
  const { targetUserId, role, status } = req.body;
  const updates = {};
  let statusChanged = false;
  try {
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

    // Update the user in the database
    const queryParts = [];
    const values = [];

    Object.keys(updates).forEach((key) => {
      queryParts.push(`${key} = ?`);
      values.push(updates[key]);
    });

    values.push(targetUserId);

    await connection.query(
      `UPDATE auth_user SET ${queryParts.join(", ")} WHERE auth_user_id = ?`,
      values
    );

    // Notify the user if status changes
    let mailOptions = {};
    if (statusChanged) {
      let mailOptions = {};
      let adminMailOptions = {};
      const adminEmails = [
        "imcwirenotifications@gmail.com",
        "admin@imcwire.com",
      ];

      if (status === "permanent_block") {
        mailOptions = {
          from: `"IMCWire Support" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: "Important Account Notification",
          html: `
            <h2>Dear ${user.username},</h2>
            <p>We regret to inform you that your IMCWire account has been permanently blocked due to violations of our Terms of Service.</p>
            <h3>Implications:</h3>
            <ul>
              <li>Your access to all IMCWire services is revoked immediately.</li>
              <li>Any subscriptions or services linked to your account are terminated.</li>
              <li>This decision is final and binding.</li>
            </ul>
            <p>If you believe this decision is incorrect, please contact us at <a href="mailto:support@imcwire.com">support@imcwire.com</a>.</p>
            <p>Best Regards,<br>IMCWire Support Team</p>
          `,
        };
      } else if (status === "temporary_block") {
        mailOptions = {
          from: `"IMCWire Support" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: "Temporary Suspension of Your IMCWire Account",
          html: `
            <h2>Dear ${user.username},</h2>
            <p>Your account has been temporarily blocked due to violations of our policies.</p>
            <h3>Impact of Suspension:</h3>
            <ul>
              <li>You cannot access your IMCWire account during the suspension period.</li>
              <li>Your account will be automatically reinstated after the suspension period.</li>
            </ul>
            <p>For more details, please review our <a href="https://imcwire.com/guidelines/">Guidelines</a>.</p>
            <p>For further questions, contact us at <a href="mailto:support@imcwire.com">support@imcwire.com</a>.</p>
            <p>Best Regards,<br>IMCWire Support Team</p>
          `,
        };
      } else if (status === "active") {
        mailOptions = {
          from: `"IMCWire Support" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: "User Activated on IMCWire Account",
          html: `
            <h2>Dear ${user.username},</h2>
            <p>Your account has been Active.</p>
            <h3>Impact of Suspension:</h3>
            <ul>
              <li>You cannot access your IMCWire account during the suspension period.</li>
              <li>Your account will be automatically reinstated after the suspension period.</li>
            </ul>
            <p>For more details, please review our <a href="https://imcwire.com/guidelines/">Guidelines</a>.</p>
            <p>For further questions, contact us at <a href="mailto:support@imcwire.com">support@imcwire.com</a>.</p>
            <p>Best Regards,<br>IMCWire Support Team</p>
          `,
        };
      } else if (status === "delete") {
        mailOptions = {
          from: `"IMCWire Support" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: "Delete User From the IMCWire Account",
          html: `
            <h2>Dear ${user.username},</h2>
            <p>Your account has been Active.</p>
            <h3>Impact of Suspension:</h3>
            <ul>
              <li>You cannot access your IMCWire account during the suspension period.</li>
              <li>Your account will be automatically reinstated after the suspension period.</li>
            </ul>
            <p>For more details, please review our <a href="https://imcwire.com/guidelines/">Guidelines</a>.</p>
            <p>For further questions, contact us at <a href="mailto:support@imcwire.com">support@imcwire.com</a>.</p>
            <p>Best Regards,<br>IMCWire Support Team</p>
          `,
        };
      }

      // Notify Admins
      adminMailOptions = {
        from: `"IMCWire Support" <${process.env.SMTP_USER}>`,
        to: adminEmails.join(","), // Send to multiple admins
        subject: "Account Status Update",
        html: `
          <h3>Account Status Update</h3>
          <p>Dear Admins,</p>
          <p>The account status of user ${user.username} (${user.email}) has been updated.</p>
          <ul>
            <li>User ID: ${user.auth_user_id}</li>
            <li>New Status: ${status}</li>
          </ul>
          <p>Please take necessary actions as per the updated status.</p>
        `,
      };

      // Send Emails
      await transporter.sendMail(mailOptions);
      await transporter.sendMail(adminMailOptions);
    }

    res.status(200).json({
      message: "User role/status updated successfully",
      updates,
    });
  } catch (error) {
    console.error("Error updating user role/status:", error);
    res.status(500).json({ error: "Error updating user role/status" });
  }
};
