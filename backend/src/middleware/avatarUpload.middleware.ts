import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// مسیر ذخیره آواتارها
const uploadPath = path.join(process.cwd(), "uploads", "avatars");

// اگر پوشه وجود نداشت، ساخته شود
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// تنظیم محل ذخیره فایل
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    const extension = path.extname(file.originalname);

    const uniqueName =
      Date.now() + "-" + crypto.randomBytes(8).toString("hex") + extension;

    cb(null, uniqueName);
  },
});

// فرمت‌های مجاز برای آواتار
const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// بررسی نوع فایل
const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("فقط فایل‌های تصویری (JPG, PNG, WEBP) مجاز هستند."));
  }
};

// خروجی نهایی
export const avatarUpload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1,
  },
});
