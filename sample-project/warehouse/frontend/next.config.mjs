/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  }
};

export default nextConfig;
