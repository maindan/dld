import path from "node:path";
import type { NextConfig } from "next";

// services/landing-generator/src/skeleton/ lives outside this app's own directory
// (a sibling workspace package). Next's serverless file tracer only auto-includes
// files it can statically resolve from import specifiers — a directory that's
// `readdir`'d/`readFile`'d at runtime via a computed path (see generate.ts's
// SKELETON_DIR) isn't one of those, so it has to be forced into the trace
// explicitly or the deployed function on Vercel would 404/ENOENT on every file
// in it despite the local dev/build working fine.
const monorepoRoot = path.join(process.cwd(), "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  outputFileTracingIncludes: {
    "/api/landing-pages/[id]/gerar": ["../../services/landing-generator/src/skeleton/**/*"],
  },
};

export default nextConfig;
