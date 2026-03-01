/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.qrserver.com',
            },
            {
                protocol: 'https',
                hostname: '**', // Allow all for merchant logos, or adjust if security is a concern
            },
        ],
    },
};

export default nextConfig;
