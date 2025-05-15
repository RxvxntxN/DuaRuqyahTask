import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// This is a special handler for Next.js API routes
export default async function handler(req, res) {
  // Initialize database
  let dbPath;

  if (process.env.VERCEL) {
    // In Vercel, copy the database to the writable /tmp directory
    const srcPath = path.join(process.cwd(), "dua_main.sqlite");
    dbPath = "/tmp/dua_main.sqlite";

    // Only copy if it doesn't exist yet
    if (!fs.existsSync(dbPath)) {
      try {
        fs.copyFileSync(srcPath, dbPath);
        console.log("Database copied to /tmp for Vercel deployment");
      } catch (err) {
        console.error("Error copying database:", err);
        return res.status(500).json({error: "Database initialization failed"});
      }
    }
  } else {
    // Local development
    dbPath = "./dua_main.sqlite";
  }

  // Initialize database connection
  let db;
  try {
    db = new Database(dbPath);
    db.prepare("SELECT 1").get();
  } catch (err) {
    console.error("Database connection failed:", err);
    return res.status(500).json({error: "Database connection failed"});
  }

  // Parse the path from the URL
  const urlPath = req.query.path || [];
  const pathString = Array.isArray(urlPath) ? urlPath.join("/") : urlPath;

  // Handle different API routes
  if (pathString === "" || pathString === "api") {
    // Root endpoint
    return res.json({
      status: "API is working",
      endpoints: [
        "/api/categories",
        "/api/categories/:cat_id/subcategories",
        "/api/subcategories/:subcat_id/duas",
        "/api/search?q=searchterm",
      ],
    });
  } else if (pathString === "categories") {
    // Get all categories
    try {
      const stmt = db.prepare(`
        SELECT 
          cat_id as id,
          cat_name_en as name_en,
          cat_name_bn as name_bn,
          no_of_subcat,
          no_of_dua,
          cat_icon as icon
        FROM category
        ORDER BY cat_id
      `);
      const categories = stmt.all();
      return res.json(categories);
    } catch (err) {
      return res.status(500).json({error: err.message});
    }
  } else if (pathString.match(/^categories\/(\d+)\/subcategories$/)) {
    // Get subcategories for a category
    const catId = pathString.split("/")[1];
    try {
      const stmt = db.prepare(`
        SELECT 
          subcat_id as id,
          subcat_name_en as name_en,
          subcat_name_bn as name_bn,
          no_of_dua
        FROM sub_category
        WHERE cat_id = ?
        ORDER BY subcat_id
      `);
      const subcategories = stmt.all(catId);
      return res.json(subcategories);
    } catch (err) {
      return res.status(500).json({error: err.message});
    }
  } else if (pathString.match(/^subcategories\/(\d+)\/duas$/)) {
    // Get duas for a subcategory
    const subcatId = pathString.split("/")[1];
    try {
      const stmt = db.prepare(`
        SELECT 
          dua_id as id,
          dua_name_en as name_en,
          dua_name_bn as name_bn,
          dua_arabic as arabic,
          clean_arabic,
          transliteration_en,
          transliteration_bn,
          translation_en,
          translation_bn,
          refference_en as reference_en,
          refference_bn as reference_bn,
          audio
        FROM dua
        WHERE subcat_id = ?
        ORDER BY dua_id
      `);
      const duas = stmt.all(subcatId);
      return res.json(duas);
    } catch (err) {
      return res.status(500).json({error: err.message});
    }
  } else if (pathString === "search") {
    // Search duas
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({error: "Search term is required"});
    }

    try {
      const stmt = db.prepare(`
        SELECT 
          dua_id as id,
          dua_name_en as name_en,
          dua_name_bn as name_bn,
          dua_arabic as arabic
        FROM dua
        WHERE 
          dua_name_en LIKE ? OR
          dua_name_bn LIKE ? OR
          dua_arabic LIKE ? OR
          translation_en LIKE ? OR
          translation_bn LIKE ?
        LIMIT 20
      `);
      const searchPattern = `%${searchTerm}%`;
      const results = stmt.all(
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern
      );
      return res.json(results);
    } catch (err) {
      return res.status(500).json({error: err.message});
    }
  } else {
    // Not found
    return res.status(404).json({error: "Endpoint not found"});
  }
}
