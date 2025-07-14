import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AUTH_URL, createAPIWrapper } from '@/src/services/api';
import { useAppDispatch } from "../utils/hooks/store";

const api = createAPIWrapper(AUTH_URL);

interface AuthState {
    Authorization?: string;
    id?: string;
    username?: string;
}

const getLocalStorageItem = (key: string) => {
    if (typeof window !== "undefined" && window.localStorage) {
        const item = localStorage.getItem(key);
        // Convert null to undefined
        return item ?? undefined;
    }
    return undefined;
};

const initialState: AuthState = {
    Authorization: getLocalStorageItem('Authorization'),
    id: getLocalStorageItem('id'),
    username: getLocalStorageItem('username'),
};

export const AuthStore = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login_state: (state, action: PayloadAction<AuthState>) => {
            const { Authorization, id, username } = action.payload;

            // Ensure that values are non-undefined by using fallback
            state.Authorization = Authorization ?? '';  // Provide default empty string if token is undefined
            state.id = id ?? ''; // Provide default empty string if wallet_id is undefined
            state.username = username ?? ''; // Provide default empty string if username is undefined

            // Save to localStorage for persistence
            if (typeof window !== "undefined" && window.localStorage) {
                localStorage.setItem('Authorization', state.Authorization);  // Always set as string
                localStorage.setItem('wallet_id', state.id);  // Always set as string
                localStorage.setItem('username', state.username);  // Always set as string
            }
        },
        clear_auth: (state) => {
            // Clear state
            state.Authorization = undefined;
            state.id = undefined;
            state.username = undefined;

            // Clear localStorage
            if (typeof window !== "undefined" && window.localStorage) {
                localStorage.removeItem('Authorization');
                localStorage.removeItem('wallet_id');
                localStorage.removeItem('username');
            }
        },
    },
});

export const { login_state, clear_auth } = AuthStore.actions;
export default AuthStore.reducer;

// Additional functions for session management
const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        address
        postalCode
        gender
        role
      }
    }
  }
`;

export async function login(
  email: string,
  password: string,
  dispatch: ReturnType<typeof useAppDispatch>
): Promise<void> {
  try {
    // 2) Call the GraphQL endpoint
    const data = await api.graphqlRequest<{
      login: {
        token: string;
        user: {
          id: string;
          email: string;
          name: string;
          address: string | null;
          postalCode: string | null;
          gender: string | null;
          role: string;
        };
      };
    }>(LOGIN_MUTATION, { email, password });

    const {
      token,
      user: { id, name },
    } = data.login;

    // 3) Dispatch into your store
    dispatch(
      AuthStore.actions.login_state({
        Authorization: token,
        id: id,         // storing the user.id here
        username: name,
      })
    );

    console.log("✅ Login successful:", data.login);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

const REGISTER_MUTATION = `
  mutation Register(
    $email: String!
    $password: String!
    $name: String!
    $address: String
    $postalCode: String
    $gender: String
  ) {
    register(
      email: $email
      password: $password
      name: $name
      address: $address
      postalCode: $postalCode
      gender: $gender
    ) {
      id
      email
      name
      address
      postalCode
      gender
      role
    }
  }
`;

export async function register(
  email: string,
  password: string,
  name: string,
  address?: string,
  postalCode?: string,
  gender?: string
): Promise<{
  id: string;
  email: string;
  name: string;
  address: string | null;
  postalCode: string | null;
  gender: string | null;
  role: string;
}> {
  try {
    const data = await api.graphqlRequest<{
      register: {
        id: string;
        email: string;
        name: string;
        address: string | null;
        postalCode: string | null;
        gender: string | null;
        role: string;
      };
    }>(REGISTER_MUTATION, {
      email,
      password,
      name,
      address,
      postalCode,
      gender,
    });

    console.log("✅ Registration successful:", data.register);
    return data.register;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}


const LOGOUT_MUTATION = `
  mutation Logout($token: String) {
    logout(token: $token) {
      success
      message
    }
  }
`;

export async function logout(dispatch: ReturnType<typeof useAppDispatch>): Promise<boolean> {

  const token = localStorage.getItem("Authorization");

  try {
    console.log("🛑 Sending logout for token:", token);

    const data = await api.graphqlRequest<{ logout: { success: boolean; message: string; } }>(
      LOGOUT_MUTATION,
      { token }
    );

    console.log("✅ Logout response:", data.logout.message);

    dispatch(clear_auth());

    localStorage.removeItem("Authorization");
    localStorage.removeItem("X-Access-Token");
    localStorage.removeItem("username");

    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

const VERIFY_AUTH_QUERY = `
  query GetUserData {
    getUserData {
      success
      message
    }
  }
`;

export async function verifyAuthToken(): Promise<{ valid: boolean }> {
  try {
    const data = await api.graphqlRequest<{
      getUserData: {
        success: boolean;
        message: string;
      };
    }>(VERIFY_AUTH_QUERY);

    const { success } = data.getUserData;

    if (success) {
      return { valid: true };
    } else {
      throw new Error("Token verification failed: success=false");
    }
  } catch (error: any) {
    console.error("Error verifying auth token:", error.message);
    throw new Error("Failed to verify authentication");
  }
}

export function initializeAuth(dispatch: any) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        const authToken = localStorage.getItem("Authorization");
        const id = localStorage.getItem("id");
        const username = localStorage.getItem("username");

        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === "/login" || currentPath === "/register";

        if (authToken) {
            dispatch(login_state({
                Authorization: authToken,
                id: id ?? undefined,
                username: username ?? undefined,
            }));
        } else if (!isAuthPage) {
            window.location.href = "/login";
        }
    } catch (error) {
        console.error("Failed to initialize auth state from localStorage", error);
        dispatch(clear_auth());
    }
}
