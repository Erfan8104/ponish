import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

// ایجاد یک Pool از کانکشن‌ها با استفاده از متغیر محیطی
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// پاس دادن adapter به کانستراکتور پریزما (الزامی در نسخه ۷ برای دیتابیس مستقیم)
export const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export default prisma;
