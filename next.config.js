const withTM = require('next-transpile-modules')([]);
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(
  withTM({
    poweredByHeader: false,
    reactStrictMode: true,
    output: 'standalone',
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      config.module.rules.push({
        test: /\.svg$/,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack'],
      });
      config.module.rules.push({
        test: /\.(glsl|vs|fs|vsh|fsh|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader', 'glslify-loader'],
      });
      return config;
    },
    images: {
      domains: [],
    },
  }),
);
