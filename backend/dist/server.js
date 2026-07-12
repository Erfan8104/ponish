"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http"); // 👈 اضافه شد
const socket_service_1 = require("./services/socket.service"); // 👈 اضافه شد
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes")); // 👈 اضافه شد
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app); // 👈 ساخت سرور HTTP از روی اکسپرس برای سوکت
// ==============================
// Middlewares
// ==============================
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ==============================
// Static Files
// ==============================
// دسترسی به فایل‌های آپلود شده
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
// ==============================
// Routes
// ==============================
app.use("/api/auth", auth_routes_1.default);
app.use("/api/profile", profile_routes_1.default);
app.use("/api/projects", project_routes_1.default);
app.use("/api/messages", message_routes_1.default); // 👈 ثبت روت دریافت تاریخچه پیام‌های چت
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
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});
// ==============================
// Start Server & Initialize Socket
// ==============================
const PORT = Number(process.env.PORT) || 3000;
// راه اندازی وب‌سوکت روی سرور مشترک با اکسپرس
(0, socket_service_1.initSocket)(httpServer); // 👈 فعال‌سازی لایه چت آنلاین و لحظه‌ای
// 👈 حالا سرور httpServer را گوش می‌دهیم نه app را
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
