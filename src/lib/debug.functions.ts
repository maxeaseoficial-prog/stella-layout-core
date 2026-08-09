import { createServerFn } from "@tanstack/react-start";

export const getBuildInfo = createServerFn({ method: "GET" })
  .handler(async () => {
    return {
      commitSha: "2d1e78e3",
      buildTimestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      serverMarker: "NF-E-SERVER-CURRENT-V4"
    };
  });
