import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Neon's HTTP driver — one query per call, no pool to manage, works in
// both the Node and edge runtimes. Fine for this app's traffic.
export const sql = neon(process.env.DATABASE_URL);
