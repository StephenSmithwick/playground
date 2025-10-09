import type { NextConfig } from "next";

// TODO: current `distDir` is a hack, we should not be hardcoding the distDir in 2 places and placing something several directories above the project.
const nextConfig: NextConfig = {
  output: "export",
  distDir: "../../comments-app",
  assetPrefix: "/comments-app",
  env: {
    API_HOST: process.env.API_HOST || "",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "",
  },
};

export default nextConfig;
