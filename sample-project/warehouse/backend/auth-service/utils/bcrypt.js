// src/utils/bcryptUtil.js
import bcrypt from "bcryptjs";

export const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(plain, salt);
};

export const comparePassword = async (plain, hash) => {
  return await bcrypt.compare(plain, hash);
};
