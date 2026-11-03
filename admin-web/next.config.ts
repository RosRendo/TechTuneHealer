import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "https://techtune.dashboardkiller.online/:path*",
      },
    ];
  },
};

export default nextConfig;
