import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  max: 1,
  connect_timeout: 30,
});

async function keepAlive() {
  try {
    const start = Date.now();
    await client`SELECT 1 as ping`;
    const elapsed = Date.now() - start;

    console.log("Keep-alive ping successful:", new Date().toISOString());
    console.log("Query took:", elapsed, "ms");

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("Keep-alive ping failed:", error);
    process.exit(1);
  }
}

keepAlive();
