import { createServerFn } from "@tanstack/react-start";

export const getBuildInfo = createServerFn({ method: "GET" })
  .handler(async () => {
    return {
      commitSha: "46a1c98a",
      buildTimestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      serverMarker: "AUTH-DEBUG-V5-46a1c98a"
    };
  });