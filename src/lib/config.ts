export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // 优先使用显式配置，其次使用当前来源（便于本地）
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }
  // 服务端兜底
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}


