/**
 * JWT Configuration
 */

// Load environment variables if not in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m",
    algorithm: "HS256",
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
    algorithm: "HS256",
  },
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
};

module.exports = jwtConfig;
