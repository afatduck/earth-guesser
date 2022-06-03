/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  images: {
    domains: ['lh3.googleusercontent.com', "storage.googleapis.com"],
  },
}

module.exports = nextConfig
