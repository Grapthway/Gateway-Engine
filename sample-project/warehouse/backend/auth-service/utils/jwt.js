// src/utils/jwtUtil.js
import jwt from "jsonwebtoken";
import { redisSet, redisGet, redisDel } from "./redisClient.js";

const JWT_SECRET = process.env.JWT_SECRET;
const TTL = 60 * 60 * 24; // 24h

export const signAuthToken = async (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TTL });
    await redisSet(payload.email, token, TTL);
    console.log(`Token generated for: ${payload.email}`);
    return token;
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("Failed to generate token");
  }
};

export const verifyAuthToken = async (token) => {
  const data = jwt.verify(token, JWT_SECRET);
  // ensure token matches what's in Redis
  const saved = await redisGet(data.email);
  if (saved !== token) throw new Error("Invalid or expired token");
  return data;
};

export const revokeAuthToken = async (token) => {
  const data = jwt.verify(token, JWT_SECRET);
  await redisDel(data.email);
};
