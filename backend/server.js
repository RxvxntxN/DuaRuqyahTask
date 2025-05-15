const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");

const app = express();
app.use(cors());
const port = 3001;

const db = new Database("./dua_main.sqlite");

try {
  db.prepare("SELECT 1").get();
  console.log("Database connected successfully");
} catch (err) {
  console.error("Database connection failed:", err);
  process.exit(1);
}

app.get("/", (req, res) => {
  res.json({
    status: "API is working",
    endpoints: [
      "/categories",
      "/categories/:cat_id/subcategories",
      "/subcategories/:subcat_id/duas",
    ],
  });
});

app.get("/categories", (req, res) => {
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
    res.json(categories);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.get("/categories/:cat_id/subcategories", (req, res) => {
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
    const subcategories = stmt.all(req.params.cat_id);
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.get("/subcategories/:subcat_id/duas", (req, res) => {
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
    const duas = stmt.all(req.params.subcat_id);
    res.json(duas);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.get("/duas/search", (req, res) => {
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
    res.json(results);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
