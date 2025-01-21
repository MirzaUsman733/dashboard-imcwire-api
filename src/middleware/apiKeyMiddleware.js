const validApiKey = process.env.API_KEY;

module.exports = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(403).json({ message: "Forbidden: Invalid API key" });
  }
  next();
};
