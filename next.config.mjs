/** @type {import('next').NextConfig} */
// BASE_PATH is only set for the GitHub preview address (yonatanstay1.github.io/koora).
// On the real domain it stays empty.
const basePath = process.env.BASE_PATH || "";
const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
