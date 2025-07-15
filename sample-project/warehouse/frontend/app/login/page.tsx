"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LuWallet } from "react-icons/lu";
import { login } from "@/src/store/auth.store";
import { useAppDispatch } from "@/src/utils/hooks/store";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState(""); // using email as username
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(username, password, dispatch);
      router.push("/shipping"); // redirect after successful login
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
    setIsLoading(false);
  };

  return (
    <>
    <div className="flex flex-col items-center min-h-screen bg-black mt-12">
      <div className="bg-white text-primary-light p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl text-primary-light font-bold mb-4">Login</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={username}
            className="border p-2 rounded w-full"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            className="border p-2 rounded w-full"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 flex flex-col items-center gap-4">
          {/* Register button */}
          <button
            type="button"
            className="px-4 py-2 bg-white rounded-[4px] text-black font-bold text-sm flex items-center justify-center border"
            onClick={() => router.push("/register")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
    </>
    
  );
};

export default LoginPage;
