import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import projectRouter from "./routes/project.routes";

dotenv.config();

const app = express();

// ==============================
// Middlewares
// ==============================

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ==============================
// Static Files
// ==============================

// دسترسی به فایل‌های آپلود شده
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ==============================
// Routes
// ==============================

app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/projects", projectRouter);

// ==============================
// Health Check
// ==============================

app.get("/", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Ponisha API Running",
    version: "1.0.0",
  });
});

// ==============================
// 404 Handler
// ==============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ==============================
// Global Error Handler
// ==============================

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  },
);

// ==============================
// Start Server
// ==============================

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
