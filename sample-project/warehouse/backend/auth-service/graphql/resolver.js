import {
  registerUser,
  loginUser,
  logoutUser,
  editUser,
  fetchUserData,
  fetchUserByEmail,
} from "../services/userService.js";
import User from "../models/User.js";

function extractAuthToken(req, tokenArg) {
  if (tokenArg) return tokenArg;
  const headerKeys = ['authorization', 'Authorization'];
  let raw;
  for (const key of headerKeys) {
    raw = req.headers[key];
    if (raw) break;
  }
  if (!raw) {
    throw new Error('Missing authentication token in headers.');
  }
  if (raw.startsWith('Bearer ')) {
    return raw.slice(7).trim();
  }
  return raw;
}

export const resolvers = {
  Mutation: {
    register: (_, { email, name, password, address, postalCode, gender }) =>
      registerUser({ email, name, password, address, postalCode, gender }),

    login: async (_, { email, password }) => {
      const { user, token } = await loginUser({ email, password });
      console.log("user and token : ",user, token);
      return { user, token };
    },

    logout: async (_, { token }, { req }) => {
      const t = extractAuthToken(req, token);
      await logoutUser(t);
      return {
        success: true,
        message: "Logged out successfully"
      };
    },

    editUser: async (_, { token, input }, { req }) => {
      const t = extractAuthToken(req, token);
      return await editUser(t, input);
    },
  },

  Query: {
    users: () => User.find().exec(),

    getUserData: async (_, { token }, { req }) => {
      console.log("req : ", req);
      const t = extractAuthToken(req, token);
      const user = await fetchUserData(t);
      return {
        success: true,
        message: "User data fetched",
        user,
      };
    },

    getUserByEmail: async (_, { email }) => {
      return fetchUserByEmail(email);
    },
  },
};