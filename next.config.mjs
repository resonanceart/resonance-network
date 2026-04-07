/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ppctfrejatshbwmremlv.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Increase API route body size limit for base64 image uploads
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default nextConfig
