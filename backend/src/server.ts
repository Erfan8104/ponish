import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";
import { initSocket } from "./services/socket.service";

import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import projectRouter from "./routes/project.routes";
import messageRoutes from "./routes/message.routes";
import contractRoutes from "./routes/contract.routes";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// مسیر پوشه فرانت‌اند که در داکر در کنار پوشه dist بک‌اند قرار می‌گیرد
const frontendDistPath = path.join(__dirname, "../dist");

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
// Static Files (Uploads)
// ==============================

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ==============================
// Routes
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/projects", projectRouter);
app.use("/api/messages", messageRoutes);
app.use("/api/contracts", contractRoutes);

// ==============================
// Health Check
// ==============================

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Ponisha API Running",
    version: "1.0.0",
  });
});

// ==============================
// Static Files & Frontend Integration
// ==============================

app.use(express.static(frontendDistPath));

// 🌟 اصلاح شده طبق استاندارد جدید path-to-regexp
app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
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
// Start Server & Initialize Socket
// ==============================

const PORT = Number(process.env.PORT) || 5000;
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
