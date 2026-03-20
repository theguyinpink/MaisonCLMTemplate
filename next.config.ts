import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wofuuxbcnahdzcdkijre.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  reactCompiler : true
};

export default nextConfig;