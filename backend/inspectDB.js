// inspectDB.js
const Database = require("better-sqlite3");

try {
  const db = new Database("./dua_main.sqlite");

  // List all tables
  console.log("Tables in database:");
  const tables = db
    .prepare(
      `
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND name NOT LIKE 'sqlite_%'
  `
    )
    .all();

  console.table(tables);

  // Show schema for each table
  tables.forEach((table) => {
    console.log(`\nStructure of ${table.name}:`);
    const schema = db.prepare(`PRAGMA table_info(${table.name})`).all();
    console.table(schema);
  });

  // Count records in each table
  tables.forEach((table) => {
    const count = db
      .prepare(`SELECT COUNT(*) as count FROM ${table.name}`)
      .get();
    console.log(`\n${table.name} contains ${count.count} records`);
  });

  db.close();
} catch (err) {
  console.error("Database error:", err);
}
