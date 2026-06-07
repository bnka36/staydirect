import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-pg',
    'pg',
    'node-ical',
    'bcryptjs',
    'cloudinary',
  ],
};

export default nextConfig;
