const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.map$/,
            use: "ignore-loader",
        });

        // Important for Puppeteer on Vercel
        if (isServer) {
            config.externals.push(/node_modules\/puppeteer-core/);
        }

        return config;
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.jsdelivr.net',
            },
        ],
    },
};

// Bundle analyzer
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));
