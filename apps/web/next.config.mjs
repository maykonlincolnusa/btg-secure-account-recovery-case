/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@secure-recovery/contracts", "@secure-recovery/ui"],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
