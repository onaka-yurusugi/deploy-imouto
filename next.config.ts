import type { NextConfig } from "next";

// ロリポップ！デプロイナウは Next.js の standalone 出力が必須
const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
