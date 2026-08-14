/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force new deployment
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  output: "standalone",
  outputFileTracingIncludes: {
    "/**": ["./node_modules/.pnpm/@swc+helpers@0.5.23/node_modules/@swc/helpers/esm/**"],
  },
  experimental: {
  },
}

export default nextConfig;
