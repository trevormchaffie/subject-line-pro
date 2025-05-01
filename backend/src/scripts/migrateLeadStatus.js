// src/scripts/migrateLeadStatus.js
const fs = require("fs").promises;
const path = require("path");

const LEADS_FILE = path.join(__dirname, "../data/leads.json");

async function migrateLeadStatus() {
  try {
    // Read existing leads
    const data = await fs.readFile(LEADS_FILE, "utf8");
    const leads = JSON.parse(data || "[]");

    let modified = false;

    // Add status to leads that don't have it
    leads.forEach((lead) => {
      if (!lead.status) {
        lead.status = "New";
        modified = true;
      }

      // Initialize notes array if it doesn't exist
      if (!lead.notes) {
        lead.notes = [];
        modified = true;
      }
    });

    // Save updated leads if needed
    if (modified) {
      await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf8");
      console.log("Successfully added status to leads without one");
    } else {
      console.log("All leads already have a status field");
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run the migration
migrateLeadStatus();
