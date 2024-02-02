const User = require("../models/user.model");
const {
  AUTH_TOKEN_MISSING_ERR,
  AUTH_HEADER_MISSING_ERR,
  JWT_DECODE_ERR,
  USER_NOT_FOUND_ERR,
} = require("../errors");
const { verifyJwtToken } = require("../utils/token.util");

module.exports = async (req, res, next) => {
  try {
    // Check for auth header from the client
    const header = req.headers.authorization;

    if (!header) {
      throw { status: 403, message: AUTH_HEADER_MISSING_ERR };
    }

    // Verify auth token
    const token = header.split("Bearer ")[1];

    if (!token) {
      throw { status: 403, message: AUTH_TOKEN_MISSING_ERR };
    }

    // Verify JWT token and get the user ID
    const userId = await verifyJwtToken(token, next);

    if (!userId) {
      throw { status: 403, message: JWT_DECODE_ERR };
    }

    // Fetch user from the database
    const user = await User.findById(userId);

    if (!user) {
      throw { status: 404, message: USER_NOT_FOUND_ERR };
    }

    // Set the user in res.locals
    res.locals.user = user;

    // Call the next middleware
    next();
  } catch (err) {
    // Pass the error to the global error handling middleware
    next(err);
  }
};
