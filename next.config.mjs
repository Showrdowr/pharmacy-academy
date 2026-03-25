import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const remotePatterns = [
  { protocol: 'http', hostname: 'localhost', port: '3001', pathname: '/**' },
  { protocol: 'http', hostname: '127.0.0.1', port: '3001', pathname: '/**' },
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (apiUrl) {
  try {
    const parsed = new URL(apiUrl);
    remotePatterns.push({
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: '/**',
    });
  } catch {
    // Ignore malformed NEXT_PUBLIC_API_URL and keep defaults.
  }
}

const nextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  images: {
    remotePatterns,
  },
};

export default withNextIntl(nextConfig);
