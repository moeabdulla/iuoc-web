import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Fixed UTC schedule; intentionally not tied to Eastern daylight-saving time.
crons.cron(
  "ingest youtube catalog",
  "0 1,16,19,22 * * *",
  internal.ingest.run,
  {},
);

export default crons;
