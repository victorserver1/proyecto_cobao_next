import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions:{
      bodySizeLimit: '20mb'
    }
  },
   images: {
    // Opción simple (Next < 15): usa "domains"
    domains: [
      'lh3.googleusercontent.com',   // Google avatar
      'avatars.githubusercontent.com', // GitHub avatar
      'res.cloudinary.com',          // Cloudinary
      'images.unsplash.com',         // Unsplash
      'cdn.tu-dominio.com',          // Tu CDN (ejemplo)
      'tu-api.com',                  // Donde sirves imágenes de posts, si aplica
    ],

    // Opción más granular:
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    //   { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    //   { protocol: 'https', hostname: 'res.cloudinary.com' },
    //   { protocol: 'https', hostname: 'cdn.tu-dominio.com' },
    // ],
    formats: ['image/avif', 'image/webp'],
  },

};

export default nextConfig;
