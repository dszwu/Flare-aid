/**
 * Standalone ingestion runner — can be called via `npm run ingest`.
 */
import { runIngestion } from "./index";

async function main() {
  console.log("Starting disaster data ingestion...");
  console.log(`Time: ${new Date().toISOString()}`);
  console.log("---");

  const result = await runIngestion();

  console.log("---");
  console.log(`Results:`);
  console.log(`  Total fetched: ${result.total}`);
  console.log(`  New events:    ${result.new}`);
  console.log(`  By source:`);
  for (const [source, count] of Object.entries(result.sources)) {
    console.log(`    ${source}: ${count}`);
  }
}

main().catch(console.error);
