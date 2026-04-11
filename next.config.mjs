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
      // Legacy Supabase project used before the Network migration. Some
      // user_profiles.avatar_url rows still point here (e.g. admin profiles
      // reconstructed from the old project during the Apr 2026 recovery).
      // Keep whitelisted until those URLs are rehosted on the current
      // project or the old project is decommissioned.
      {
        protocol: 'https',
        hostname: 'roshdgbppmasptzazgda.supabase.co',
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
