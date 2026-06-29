<script setup lang="ts">
// وارد کردن تمام کامپوننت‌هایی که در پوشه home داری
import HomeHero from '@/components/home/HomeHero.vue'
import HomeStats from '@/components/home/HomeStats.vue'
import ServicesGrid from '@/components/home/ServicesGrid.vue'
import PlatformSection from '@/components/home/PlatformSection.vue'
import FeaturesSection from '@/components/home/FeaturesSection.vue'
import ExpertCard from '@/components/home/ExpertCard.vue'
import EmployerCard from '@/components/home/EmployerCard.vue'
</script>

<template>
  <main class="min-h-screen bg-slate-50/50" dir="rtl">
    <!-- ۱. بخش هیرو (اولین چیزی که کاربر می‌بیند) -->
    <HomeHero />

    <!-- ۲. بخش آمار (اعتمادسازی سریع بعد از هیرو) -->
    <HomeStats />

    <!-- ۳. شبکه‌ی خدمات (کاربر متوجه می‌شود چه کارهایی انجام می‌دهید) -->
    <ServicesGrid />

    <!-- ۴. پلتفرم (توضیح درباره نحوه کارکرد سیستم) -->
    <PlatformSection />

    <!-- ۵. ویژگی‌ها (چرا باید ما را انتخاب کنند؟) -->
    <FeaturesSection />

    <!-- ۶. بخش نمایش متخصصین و کارفرمایان (اختیاری - برای استفاده از کارت‌ها) -->
    <section class="py-20 px-6 max-w-7xl mx-auto">
      <div class="grid md:grid-cols-2 gap-8">
        <!-- نمونه استفاده از کارت کارفرما -->

        <!-- نمونه استفاده از کارت متخصص -->
      </div>
    </section>
  </main>
</template>
