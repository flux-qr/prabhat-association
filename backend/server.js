const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 4000;

// Admin password (change this)
const ADMIN_KEY = process.env.ADMIN_KEY || "prabhat-admin-2025";

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// SQLite database
const db = new sqlite3.Database(path.join(__dirname, "database.sqlite"), (err) => {
  if (err) {
    console.error("DB error:", err);
  } else {
    console.log("SQLite connected.");
  }
});

// Create table if not exists
db.run(
  `CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    budget INTEGER NOT NULL,
    property_type TEXT NOT NULL,
    consent INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`
);

// API: save lead
app.post("/api/leads", (req, res) => {
  const { name, phone, budget, propertyType, consent } = req.body || {};

  if (!name || !phone || !budget || !propertyType || !consent) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const stmt = db.prepare(
    "INSERT INTO leads (name, phone, budget, property_type, consent) VALUES (?, ?, ?, ?, ?)"
  );

  stmt.run(
    name,
    phone,
    budget,
    propertyType,
    consent ? 1 : 0,
    function (err) {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({ error: "DB error" });
      }
      return res.json({ success: true, id: this.lastID });
    }
  );

  stmt.finalize();
});

// API: get all leads (admin protected)
app.get("/api/leads", (req, res) => {
  const key = req.header("x-admin-key");
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  db.all(
    "SELECT id, name, phone, budget, property_type, consent, created_at FROM leads ORDER BY created_at DESC",
    (err, rows) => {
      if (err) {
        console.error("Select error:", err);
        return res.status(500).json({ error: "DB error" });
      }
      res.json(rows);
    }
  );
});

// Admin panel page
app.get("/admin-panel", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Fallback: serve index.html for any other route (optional)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Admin password (ADMIN_KEY):", ADMIN_KEY);
});
