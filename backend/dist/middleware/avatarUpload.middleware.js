"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
// مسیر ذخیره آواتارها
const uploadPath = path_1.default.join(process.cwd(), "uploads", "avatars");
// اگر پوشه وجود نداشت، ساخته شود
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
// تنظیم محل ذخیره فایل
const storage = multer_1.default.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadPath);
    },
    filename(req, file, cb) {
        const extension = path_1.default.extname(file.originalname);
        const uniqueName = Date.now() + "-" + crypto_1.default.randomBytes(8).toString("hex") + extension;
        cb(null, uniqueName);
    },
});
// فرمت‌های مجاز برای آواتار
const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
// بررسی نوع فایل
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("فقط فایل‌های تصویری (JPG, PNG, WEBP) مجاز هستند."));
    }
};
// خروجی نهایی
exports.avatarUpload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
        files: 1,
    },
});
