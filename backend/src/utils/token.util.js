import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

export function generateAccessToken(userId, userName) {
  try {
    const payload = {
      _id: userId,
      userName,
    };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
}

export function generateRefreshToken(userId, userName) {
  try {
    const payload = {
      _id: userId,
      userName,
      // Unique per token so rotation produces a distinct token even when two
      // are minted in the same second (iat has only 1s resolution).
      jti: randomUUID(),
    };
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}
