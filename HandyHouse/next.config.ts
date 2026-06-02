import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'host', value: '(?<host>.*):3001' }],
          destination: '/crm',
        },
        {
          source: '/',
          has: [{ type: 'host', value: '(?<host>.*):3002' }],
          destination: '/hr',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
