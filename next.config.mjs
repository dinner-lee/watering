/** @type {import('next').NextConfig} */
const nextConfig = {
  // 손글씨 사진은 용량이 클 수 있어 서버 액션/라우트 본문 한도를 넉넉히 둡니다.
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
