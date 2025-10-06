const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Cookie se token le lo

  if (!token) {
    return res.status(403).json({ 
      success: false,
      message: "Please login first to access this resource" 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ 
        success: false,
        message: "Session expired. Please login again" 
      });
    }

    // Token valid hai, user details ko request object mein add karo
    req.user = { id: decoded.id, email: decoded.email };
    next(); // Agla middleware ya route handler call karo
  });
};

module.exports = verifyToken;
