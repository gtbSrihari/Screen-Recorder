// backend/server.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ensure uploads dir exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});
const upload = multer({ storage });

// SQLite DB (file in backend/)
const dbFile = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) console.error("SQLite error:", err);
  else console.log("Connected to SQLite:", dbFile);
});

// create table
db.run(`CREATE TABLE IF NOT EXISTS recordings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  filesize INTEGER NOT NULL,
  createdAt TEXT NOT NULL
)`);

// helper to build full URL for a recording
function recordingUrl(req, id) {
  return `${req.protocol}://${req.get("host")}/api/recordings/${id}`;
}

// POST upload
app.post("/api/recordings", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded (key: video)" });
  const filename = req.file.filename;
  const filepath = req.file.path; // absolute path on server
  const filesize = req.file.size;
  const createdAt = new Date().toISOString();

  db.run(
    `INSERT INTO recordings (filename, filepath, filesize, createdAt) VALUES (?, ?, ?, ?)`,
    [filename, filepath, filesize, createdAt],
    function (err) {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).json({ message: "DB insert failed" });
      }
      const id = this.lastID;
      return res.status(201).json({
        message: "Recording uploaded successfully",
        recording: {
          id,
          filename,
          filesize,
          createdAt,
          url: recordingUrl(req, id)
        }
      });
    }
  );
});

// GET list
app.get("/api/recordings", (req, res) => {
  db.all(`SELECT id, filename, filesize, createdAt FROM recordings ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB read failed" });
    const data = rows.map(r => ({ ...r, url: recordingUrl(req, r.id) }));
    res.json(data);
  });
});

// GET file streaming
app.get("/api/recordings/:id", (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM recordings WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (!row) return res.status(404).json({ message: "Recording not found" });
    // send the actual file
    res.sendFile(path.resolve(row.filepath));
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
