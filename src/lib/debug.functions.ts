import { createServerFn } from "@tanstack/react-start";

export const getBuildInfo = createServerFn({ method: "GET" })
  .handler(async () => {
    return {
      commitSha: "01a2d8f1",
      buildTimestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      serverMarker: "AUTH-DEBUG-V5-01a2d8f1"
    };
  });