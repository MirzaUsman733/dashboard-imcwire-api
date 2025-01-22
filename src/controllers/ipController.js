// controllers/ipController.js
exports.getIpAddress = (req, res) => {
  const clientIp =
    req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || req.ip;

  res.status(200).json({ ip: clientIp });
};
