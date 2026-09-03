/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_ACTIONS || false;
const repoName = 'lao-preorder-app';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isGithubPages ? `/${repoName}` : '',
  assetPrefix: isGithubPages ? `/${repoName}/` : '',
  trailingSlash: true,
};

export default nextConfig;
