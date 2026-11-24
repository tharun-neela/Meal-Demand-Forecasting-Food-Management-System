import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;

