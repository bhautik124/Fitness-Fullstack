const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Cookie se token le lo

  if (!token) {
    return res.status(403).send("Token is required for authentication");
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid token");
    }

    // Token valid hai, user details ko request object mein add karo
    req.user = { id: decoded.id, email: decoded.email };
    next(); // Agla middleware ya route handler call karo
  });
};

module.exports = verifyToken;
