/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['images.unsplash.com', 'assets.aceternity.com'],
  },
  async headers() {
    return [
      {
        source:
          '/:path(favicon.ico|favicon.svg|apple-touch-icon.png|llms.txt|llms-full.txt|ai-profile.md|ai-projects.md|ai-faq.md)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=14400, s-maxage=86400, must-revalidate',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800, must-revalidate',
          },
        ],
      },
      {
        source: '/oosu-projects/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800, must-revalidate',
          },
        ],
      },
      {
        source: '/oosu-avatar/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800, must-revalidate',
          },
        ],
      },
    ];
  },
  eslint: {
    // Ne bloque PAS le build en cas d'erreurs eslint
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
