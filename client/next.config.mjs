/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com", "raw.githubusercontent.com"],
  },
};

export default nextConfig;
