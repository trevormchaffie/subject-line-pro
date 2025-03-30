/**
 * JWT Configuration
 */

// Load environment variables if not in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || "your-access-secret-key",
    expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m",
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
  },
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
};

module.exports = jwtConfig;
