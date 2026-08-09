import { createServerFn } from "@tanstack/react-start";

export const getBuildInfo = createServerFn({ method: "GET" })
  .handler(async () => {
    return {
      commitSha: "aa26f1dc",
      buildTimestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      serverMarker: "AUTH-DEBUG-V5"
    };
  });