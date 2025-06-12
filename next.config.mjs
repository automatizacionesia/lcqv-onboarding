/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Remueve la advertencia sobre el directorio src
    externalDir: true,
  }
};

export default nextConfig;
