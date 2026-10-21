export const APP_CONFIG = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Malayalam Subtitle AI",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  maxUploadMb: 500,
  supportedFormats: [".mp4"],
} as const;
