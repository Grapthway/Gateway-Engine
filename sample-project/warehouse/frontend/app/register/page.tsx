"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/src/store/auth.store";

const RegisterPage: React.FC = () => {
  const router = useRouter();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [gender, setGender] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register(
        email,
        password,
        name,
        address || undefined,
        postalCode || undefined,
        gender || undefined
      );
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black mt-12">
      <div className="bg-white text-primary-light p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            className="border p-2 rounded w-full"
            onChange={(e) => setEmail(e.target.value)}
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
          <input
            type="text"
            placeholder="Name (optional)"
            value={name}
            className="border p-2 rounded w-full"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Address (optional)"
            value={address}
            className="border p-2 rounded w-full"
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            type="text"
            placeholder="Postal Code (optional)"
            value={postalCode}
            className="border p-2 rounded w-full"
            onChange={(e) => setPostalCode(e.target.value)}
          />
          <input
            type="text"
            placeholder="Gender (optional)"
            value={gender}
            className="border p-2 rounded w-full"
            onChange={(e) => setGender(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <button
            className="text-blue-500 hover:underline"
            onClick={() => router.push("/login")}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
