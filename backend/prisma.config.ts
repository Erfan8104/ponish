import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL, // آدرس دیتابیس برای مایگریشن‌ها اینجا قرار می‌گیرد
  },
});
