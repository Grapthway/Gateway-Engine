import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { signAuthToken, verifyAuthToken, revokeAuthToken } from "../utils/jwt.js";

export const registerUser = async ({ email, name, password, address, postalCode, gender }) => {
  const normalizedEmail = email.toLowerCase();

  // 1. Check email availability
  if (await User.exists({ email: normalizedEmail })) {
    throw new Error("Email already in use");
  }

  // 2. Validate password strength
  if (!/(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new Error("Password must contain at least one uppercase letter and one number");
  }

  // 3. Hash & save
  const hashed = await hashPassword(password);
  return await User.create({
    email: normalizedEmail,
    name,
    password: hashed,
    address,
    postalCode,
    gender,
  });
};


export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).exec();
  if (!user) throw new Error("Username and password incorrect");

  if (!await comparePassword(password, user.password)) {
    throw new Error("Username and password incorrect");
  }

  const token = await signAuthToken({
    email: user.email,
    name: user.name,
    role: user.role,
    type: "auth",
  });

  const userObj = user.toObject();
  return { user: userObj, token };
};


export const logoutUser = async (token) => {
  // 1. Verify token & 2. Revoke
  console.log("Accessed logout");
  await revokeAuthToken(token);
};

export const editUser = async (token, updates) => {
  // 1. Verify token & extract email
  const { email } = await verifyAuthToken(token);
  // 2. Fetch & update
  const user = await User.findOne({ email }).exec();
  if (!user) throw new Error("Unauthorized");
  Object.assign(user, updates);
  return await user.save();
};

export const fetchUserData = async (token) => {
  const { email } = await verifyAuthToken(token);
  const user = await User.findOne({ email }).exec();
  if (!user) throw new Error("User not found");
  
  // Convert to object to include virtuals
  return user.toObject();
};

export const fetchUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).exec();
  if (!user) throw new Error("User with that email not found");
  
  return user.toObject();
};
