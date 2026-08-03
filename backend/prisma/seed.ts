import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt"; // 🌟 ایمپورت برای هش کردن رمز عبور ادمین

// خواندن متغیرهای محیطی برای اتصال به دیتابیس
dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 در حال درج اطلاعات اولیه...");

  // ۱. درج دسته‌بندی‌های پیش‌فرض
  const categories = [
    {
      name: "نقشه‌برداری زمینی",
      slug: "mapping",
      description: "برداشت با توتال استیشن و GPS",
    },
    {
      name: "عکس‌برداری هوایی",
      slug: "drone",
      description: "تصویربرداری هوایی و تهیه ارتوفتو",
    },
    {
      name: "خدمات GIS",
      slug: "gis",
      description: "تحلیل داده، ژئورفرنس و پایگاه داده",
    },
    {
      name: "ترسیم و کارتوگرافی",
      slug: "drafting",
      description: "امور ثبتی، نقشه‌کشی و کارتوگرافی",
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ دسته‌بندی‌ها با موفقیت اضافه شدند.");

  // ۲. ایجاد یا به‌روزرسانی ادمین پیش‌فرض 🌟
  const adminPhone = "09120000000"; // شماره تلفن دلخواه برای ادمین
  const rawPassword = "AdminSecretPassword123"; // رمز عبور اولیه ادمین
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {
      role: "admin",
    },
    create: {
      phone: adminPhone,
      password: hashedPassword,
      role: "admin",
      name: "مدیر کل سیستم",
      profileCompleted: true,
      isVerified: true,
    },
  });

  console.log(
    `✅ حساب ادمین با شماره ${adminPhone} و رمز عبور ${rawPassword} ایجاد شد.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
