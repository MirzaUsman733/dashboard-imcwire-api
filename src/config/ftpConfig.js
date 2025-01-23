require("dotenv").config();

const ftpConfig = {
  host: process.env.EXPRESS_FTP_HOST || "141.136.43.210",
  user: process.env.EXPRESS_FTP_USER || "u810641239.imcwire.com",
  password: process.env.EXPRESS_FTP_PASSWORD || "9/L54$edWGaUz?6",
  port: parseInt(process.env.EXPRESS_FTP_PORT || "21"),
  secure: true,
  secureOptions: { rejectUnauthorized: false },
};

module.exports = ftpConfig;
