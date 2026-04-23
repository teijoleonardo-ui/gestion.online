/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // pdfjs-dist contiene una rama para Node (DOMMatrix, canvas) que no se usa
  // en el browser pero que Webpack/Turbopack resuelve igual. Ignorándola el
  // bundle sigue funcionando en el cliente.
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false,
      encoding: false,
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      canvas: { browser: "./lib/empty-module.js" },
      encoding: { browser: "./lib/empty-module.js" },
    },
  },
};

export default nextConfig;
