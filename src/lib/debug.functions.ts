import { createServerFn } from "@tanstack/react-start";

export const getBuildInfo = createServerFn({ method: "GET" })
  .handler(async () => {
    return {
      commitSha: "f8b2c4e9",
      buildTimestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      serverMarker: "PERSISTENCE-V1-f8b2c4e9"
    };
  });