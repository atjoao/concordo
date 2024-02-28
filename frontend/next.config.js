/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        serverIp: "http://localhost:3000",
    },

    eslint: {
        ignoreDuringBuilds: true,
    },

    webpack: (config) => {
        // Add aliases for missing modules
        config.resolve.alias.bufferutil = "bufferutil";
        config.resolve.alias["utf-8-validate"] = "utf-8-validate";

        return config;
    },

    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
