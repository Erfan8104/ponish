# --- مرحله ۱: بیلد کردن فرانت‌اند ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- مرحله ۲: بیلد و اجرای بک‌اند ---
FROM node:20-alpine
WORKDIR /usr/src/app

COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm install

COPY backend/ ./

# انتقال پوشه dist فرانت‌اند به کنار فایل‌های بک‌اند
COPY --from=frontend-builder /app/frontend/dist ./dist

RUN npm run build

EXPOSE 5000

# استفاده از db push برای اعمال خودکار جدول‌ها در دیتابیس هنگام بالا آمدن کانتینر
CMD ["sh", "-c", "npx prisma db push && npm start"]