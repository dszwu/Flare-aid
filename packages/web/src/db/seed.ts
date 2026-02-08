import { db, ensureDb } from "./index";
import bcrypt from "bcryptjs";

/**
 * Seeds the database with initial admin user and sample organizations.
 * Safe to run multiple times — skips if data already exists.
 */
export async function seed() {
  await ensureDb();

  // Seed default admin
  const existingAdmin = await db.query(
    "SELECT id FROM admins WHERE email = $1",
    ["admin@flareaid.org"]
  );

  if (existingAdmin.rows.length === 0) {
    const hash = bcrypt.hashSync("admin123", 10);
    await db.query(
      "INSERT INTO admins (email, password_hash, role, created_at) VALUES ($1, $2, $3, $4)",
      ["admin@flareaid.org", hash, "admin", new Date().toISOString()]
    );
    console.log("Seeded admin: admin@flareaid.org / admin123");
  } else {
    console.log("Admin already exists, skipping.");
  }

  // Seed sample organizations
  const orgCount = await db.query("SELECT COUNT(*) as cnt FROM organizations");
  const cnt = parseInt(orgCount.rows[0]?.cnt || "0");
  if (cnt === 0) {
    const sampleOrgs = [
      { name: "Red Cross International", country: "Switzerland", wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f5bA16" },
      { name: "Médecins Sans Frontières", country: "France", wallet: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199" },
      { name: "Direct Relief", country: "United States", wallet: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0" },
      { name: "ShelterBox", country: "United Kingdom", wallet: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E" },
      { name: "Kenya Red Cross", country: "Kenya", wallet: "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec" },
    ];

    for (const org of sampleOrgs) {
      await db.query(
        `INSERT INTO organizations (name, country, wallet_address, payout_method, payout_details, allowlisted, created_at)
         VALUES ($1, $2, $3, 'bank', '{}', 1, $4)`,
        [org.name, org.country, org.wallet, new Date().toISOString()]
      );
    }
    console.log(`Seeded ${sampleOrgs.length} organizations`);
  } else {
    console.log(`Organizations already seeded (${cnt} found), skipping.`);
  }
}

// Run if called directly
seed().catch(console.error);
