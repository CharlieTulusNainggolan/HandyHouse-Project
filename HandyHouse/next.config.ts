import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const crmServiceUrl = process.env.CRM_SERVICE_URL || 'http://localhost:5001';
    const hrServiceUrl = process.env.HR_SERVICE_URL || 'http://localhost:5002';

    return {
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'host', value: 'crm.localhost' }],
          destination: '/crm',
        },
        {
          source: '/',
          has: [{ type: 'host', value: 'hr.localhost' }],
          destination: '/hr',
        },
      ],
      afterFiles: [
        {
          source: '/api/crm/:path*',
          destination: `${crmServiceUrl}/api/crm/:path*`,
        },
        {
          source: '/api/hr/:path*',
          destination: `${hrServiceUrl}/api/hr/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
