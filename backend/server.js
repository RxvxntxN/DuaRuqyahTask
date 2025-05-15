const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000", // For local development
      process.env.NEXT_PUBLIC_VERCEL_URL, // For production
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const port = process.env.PORT || 3001;

let dbPath;
if (process.env.VERCEL) {
  const srcPath = path.join(process.cwd(), "dua_main.sqlite");
  dbPath = "/tmp/dua_main.sqlite";

  if (!fs.existsSync(dbPath)) {
    fs.copyFileSync(srcPath, dbPath);
    console.log("Database copied to /tmp for Vercel deployment");
  }
} else {
  dbPath = "./dua_main.sqlite";
}

// Database connection
let db;
try {
  db = new Database(dbPath);
  db.prepare("SELECT 1").get();
  console.log("Database connected successfully");
} catch (err) {
  console.error("Database connection failed:", err);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
// API Documentation at root
app.get("/api", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.json({
    status: "API is working",
    endpoints: {
      categories: `${API_URL}/categories`,
      subcategories: `${API_URL}/categories/:cat_id/subcategories`,
      duas: `${API_URL}/subcategories/:subcat_id/duas`,
      search: `${API_URL}/search?q=query`,
    },
  });
});

// API Status
app.get("/api", (req, res) => {
  res.json({
    status: "Musabbir, your API is working !!",
    database: db ? "Connected" : "Disconnected",
  });
});

// Categories
app.get("/api/categories", (req, res) => {
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
    res.json(stmt.all());
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Subcategories
app.get("/api/categories/:cat_id/subcategories", (req, res) => {
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
    res.json(stmt.all(req.params.cat_id));
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Duas
app.get("/api/subcategories/:subcat_id/duas", (req, res) => {
  try {
    const fields = req.query.fields ? req.query.fields.split(",") : null;

    // If only specific fields are requested
    if (fields) {
      // Map the requested fields to their database column names
      const fieldMapping = {
        id: "dua_id as id",
        name_en: "dua_name_en as name_en",
        name_bn: "dua_name_bn as name_bn",
        arabic: "dua_arabic as arabic",
        clean_arabic: "clean_arabic",
        transliteration_en: "transliteration_en",
        transliteration_bn: "transliteration_bn",
        translation_en: "translation_en",
        translation_bn: "translation_bn",
        reference_en: "refference_en as reference_en",
        reference_bn: "refference_bn as reference_bn",
        audio: "audio",
      };

      // Filter only valid fields
      const validFields = fields.filter((field) => fieldMapping[field]);

      if (validFields.length === 0) {
        return res.status(400).json({error: "No valid fields specified"});
      }

      // Create the SQL query with only the requested fields
      const selectFields = validFields
        .map((field) => fieldMapping[field])
        .join(", ");

      const stmt = db.prepare(`
        SELECT ${selectFields}
        FROM dua
        WHERE subcat_id = ?
        ORDER BY dua_id
      `);

      res.json(stmt.all(req.params.subcat_id));
    } else {
      // Return all fields (existing behavior)
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
      res.json(stmt.all(req.params.subcat_id));
    }
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Search
app.get("/api/search", (req, res) => {
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
    res.json(
      stmt.all(
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern
      )
    );
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    suggestion: "Try /api/categories or /api/search?q=query",
  });
});

// Server start (local only)
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`
      Server running on http://localhost:${port}
      Available endpoints:
      - GET /api/categories
      - GET /api/search?q=query
    `);
  });
}

module.exports = app;
