// src/utils/redisClient.js
import redis from "redis";
// import { promisify } from "util";

const client = redis.createClient({
  url: process.env.REDIS_URL
});

client.connect();

export const redisSet = async (key, value, ttlSeconds) => {
  await client.setEx(key, ttlSeconds, value);
};

export const redisGet = async (key) => {
  return await client.get(key);
};

export const redisDel = async (key) => {
  return await client.del(key);
};
