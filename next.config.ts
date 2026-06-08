import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
