import { db } from "./index";
import bcrypt from "bcryptjs";

/**
 * Seeds the database with initial admin user and sample organizations.
 * Safe to run multiple times — skips if data already exists.
 */
export function seed() {
  // Seed default admin
  const existingAdmin = db
    .prepare("SELECT id FROM admins WHERE email = ?")
    .get("admin@flareaid.org") as any;

  if (!existingAdmin) {
    const hash = bcrypt.hashSync("admin123", 10);
    db.prepare(
      "INSERT INTO admins (email, password_hash, role, created_at) VALUES (?, ?, ?, ?)"
    ).run("admin@flareaid.org", hash, "admin", new Date().toISOString());
    console.log("Seeded admin: admin@flareaid.org / admin123");
  } else {
    console.log("Admin already exists, skipping.");
  }

  // Seed sample organizations
  const orgCount = db.prepare("SELECT COUNT(*) as cnt FROM organizations").get() as any;
  if (!orgCount || orgCount.cnt === 0) {
    const sampleOrgs = [
      { name: "Red Cross International", country: "Switzerland", wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f5bA16" },
      { name: "Médecins Sans Frontières", country: "France", wallet: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199" },
      { name: "Direct Relief", country: "United States", wallet: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0" },
      { name: "ShelterBox", country: "United Kingdom", wallet: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E" },
      { name: "Kenya Red Cross", country: "Kenya", wallet: "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec" },
    ];

    const stmt = db.prepare(
      `INSERT INTO organizations (name, country, wallet_address, payout_method, payout_details, allowlisted, created_at)
       VALUES (?, ?, ?, 'bank', '{}', 1, ?)`
    );

    for (const org of sampleOrgs) {
      stmt.run(org.name, org.country, org.wallet, new Date().toISOString());
    }
    console.log(`Seeded ${sampleOrgs.length} organizations`);
  } else {
    console.log(`Organizations already seeded (${orgCount.cnt} found), skipping.`);
  }
}

// Run if called directly
seed();
