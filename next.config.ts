import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "www.southernridgeudc.org" }],
        destination: "https://southernridgeudc.org/",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.southernridgeudc.org" }],
        destination: "https://southernridgeudc.org/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
