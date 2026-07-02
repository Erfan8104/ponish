import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// مسیر ذخیره فایل‌ها
const uploadPath = path.join(process.cwd(), "uploads", "projects");

// اگر پوشه وجود نداشت ساخته شود
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// تنظیم محل ذخیره
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

// فرمت‌های مجاز
const allowedMimeTypes = [
  "application/pdf",

  "image/jpeg",
  "image/jpg",
  "image/png",

  "application/zip",
  "application/x-zip-compressed",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",

  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",

  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

// بررسی نوع فایل
const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("نوع فایل مجاز نیست."));
  }
};

// خروجی نهایی
export const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 10,
  },
});
