import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { UserProfile } from "./src/types";

const app = express();
const PORT = 3000;

// Setup directories for database and uploads
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, "db.json");

// Helper function to read/write JSON database
interface Database {
  users: Record<string, { registrationNumber: string; userName: string; password: string }>;
  profiles: Record<string, UserProfile>;
}

function readDb(): Database {
  if (!fs.existsSync(DB_FILE)) {
    return { users: {}, profiles: {} };
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB file:", err);
    return { users: {}, profiles: {} };
  }
}

function writeDb(db: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing DB file:", err);
  }
}

// Setup multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename while preserving extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static route for serving uploaded files
app.use("/uploads", express.static(UPLOADS_DIR));

// 1. API - Register User
app.post("/api/register", (req, res) => {
  const { userName, registrationNumber, password } = req.body;

  if (!userName || !registrationNumber || !password) {
    return res.status(400).json({ error: "Thiếu thông tin đăng ký bắt buộc." });
  }

  const db = readDb();
  const regNormalized = registrationNumber.trim().toLowerCase();

  if (db.users[regNormalized]) {
    return res.status(400).json({ error: "Số đăng ký này đã tồn tại." });
  }

  // Save credentials
  db.users[regNormalized] = {
    registrationNumber: registrationNumber.trim(),
    userName: userName.trim(),
    password: password, // Store password securely or in plain comparison for sandbox simplicity
  };

  // Initialize a beautiful empty default profile for new users
  const defaultProfile: UserProfile = {
    registrationNumber: registrationNumber.trim(),
    userName: userName.trim(),
    aboutMe: {
      paragraph: "Chào mọi người! Mình là " + userName + ". Hãy giới thiệu bản thân của bạn tại đây.",
      imageUrl: "",
    },
    academy: [],
    experiences: [],
    activities: [],
    contact: {
      phoneNumber: "",
      emailAddress: "",
      linkedinLink: "",
      facebookLink: "",
    },
  };

  db.profiles[regNormalized] = defaultProfile;
  writeDb(db);

  return res.json({ success: true, message: "Đăng ký thành công!" });
});

// 2. API - Login User
app.post("/api/login", (req, res) => {
  const { registrationNumber, password } = req.body;

  if (!registrationNumber || !password) {
    return res.status(400).json({ error: "Số đăng ký và mật khẩu là bắt buộc." });
  }

  const db = readDb();
  const regNormalized = registrationNumber.trim().toLowerCase();
  const user = db.users[regNormalized];

  if (!user || user.password !== password) {
    return res.status(400).json({ error: "Số đăng ký hoặc mật khẩu không chính xác." });
  }

  return res.json({
    success: true,
    user: {
      registrationNumber: user.registrationNumber,
      userName: user.userName,
    },
  });
});

// Get first profile in DB (as fallback)
app.get("/api/profile-first", (req, res) => {
  const db = readDb();
  const keys = Object.keys(db.profiles);
  if (keys.length === 0) {
    return res.status(404).json({ error: "Chưa có hồ sơ nào được đăng ký." });
  }
  // Return the first profile
  return res.json(db.profiles[keys[0]]);
});

// 3. API - Get Profile
app.get("/api/profile/:registrationNumber", (req, res) => {
  const { registrationNumber } = req.params;
  const db = readDb();
  const regNormalized = registrationNumber.trim().toLowerCase();
  const profile = db.profiles[regNormalized];

  if (!profile) {
    return res.status(404).json({ error: "Không tìm thấy hồ sơ cho số đăng ký này." });
  }

  return res.json(profile);
});

// 4. API - Update Profile
app.put("/api/profile/:registrationNumber", (req, res) => {
  const { registrationNumber } = req.params;
  const updatedProfile = req.body;
  const authHeader = req.headers["x-user-reg"];

  if (!authHeader || authHeader.toString().toLowerCase() !== registrationNumber.toLowerCase()) {
    return res.status(403).json({ error: "Bạn không có quyền chỉnh sửa hồ sơ này." });
  }

  const db = readDb();
  const regNormalized = registrationNumber.trim().toLowerCase();

  if (!db.users[regNormalized]) {
    return res.status(404).json({ error: "Tài khoản không tồn tại." });
  }

  db.profiles[regNormalized] = {
    ...db.profiles[regNormalized],
    ...updatedProfile,
    registrationNumber: db.profiles[regNormalized].registrationNumber, // Prevent registry modification
  };

  writeDb(db);
  return res.json({ success: true, profile: db.profiles[regNormalized] });
});

// 5. API - File Upload
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Vui lòng chọn file cần tải lên." });
  }

  // Build the access URL
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    success: true,
    fileUrl,
    fileName: req.file.originalname,
  });
});

// 6. API - Delete Account
app.delete("/api/account/:registrationNumber", (req, res) => {
  const { registrationNumber } = req.params;
  const authHeader = req.headers["x-user-reg"];

  if (!authHeader || authHeader.toString().toLowerCase() !== registrationNumber.toLowerCase()) {
    return res.status(403).json({ error: "Bạn không có quyền xóa tài khoản này." });
  }

  const db = readDb();
  const regNormalized = registrationNumber.trim().toLowerCase();

  if (!db.users[regNormalized]) {
    return res.status(404).json({ error: "Tài khoản không tồn tại." });
  }

  // Delete associated local uploaded profile image if any
  const profile = db.profiles[regNormalized];
  if (profile && profile.aboutMe && profile.aboutMe.imageUrl) {
    const imageUrl = profile.aboutMe.imageUrl;
    if (imageUrl.startsWith("/uploads/")) {
      const fileName = imageUrl.substring("/uploads/".length);
      const filePath = path.join(UPLOADS_DIR, fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Error deleting image file:", e);
        }
      }
    }
  }

  // Delete the records from DB
  delete db.users[regNormalized];
  delete db.profiles[regNormalized];
  writeDb(db);

  return res.json({ success: true, message: "Tài khoản đã được xóa thành công." });
});

// Serve frontend build / assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
