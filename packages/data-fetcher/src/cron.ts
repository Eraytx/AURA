import cron from "node-cron";
import { ForexFactoryClient } from "./ForexFactoryClient";

const client = new ForexFactoryClient();

console.log("⏰ Economic calendar sync cron service initialized.");

// Run synchronization immediately on startup
client.syncCalendar().catch((err) => {
  console.error("Startup calendar synchronization failed:", err.message);
});

// Schedule task to run every 10 minutes
cron.schedule("*/10 * * * *", () => {
  console.log("⏰ Cron execution: Starting calendar sync job...");
  client.syncCalendar().catch((err) => {
    console.error("Cron calendar synchronization failed:", err.message);
  });
});
