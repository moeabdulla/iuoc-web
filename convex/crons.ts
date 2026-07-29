import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Times are UTC and pinned to the current US Eastern (EDT, UTC-4) offset for
// noon/3pm/6pm/9pm ET; they'll drift an hour during EST (winter).
crons.daily(
  "ingest youtube catalog 12pm ET",
  { hourUTC: 16, minuteUTC: 0 },
  internal.ingest.run,
  {},
);
crons.daily(
  "ingest youtube catalog 3pm ET",
  { hourUTC: 19, minuteUTC: 0 },
  internal.ingest.run,
  {},
);
crons.daily(
  "ingest youtube catalog 6pm ET",
  { hourUTC: 22, minuteUTC: 0 },
  internal.ingest.run,
  {},
);
crons.daily(
  "ingest youtube catalog 9pm ET",
  { hourUTC: 1, minuteUTC: 0 },
  internal.ingest.run,
  {},
);

export default crons;
