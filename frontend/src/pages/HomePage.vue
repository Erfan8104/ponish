<template>
  <div class="bg-white min-h-screen text-right" dir="rtl">
    <section class="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <video
        autoplay
        loop
        muted
        playsinline
        class="absolute z-10 w-auto min-w-full min-h-full max-w-none object-cover"
      >
        <source src="@/assets/homepage.mp4" type="video/mp4" />
        مرورگر شما از تگ ویدیو پشتیبانی نمی‌کند.
      </video>

      <div class="absolute inset-0 bg-black/50 z-20"></div>

      <div class="relative z-30 max-w-4xl mx-auto px-6 text-center text-white space-y-6">
        <span
          class="inline-flex items-center gap-2 bg-emerald-600/30 backdrop-blur-sm text-emerald-300 px-4 py-2 rounded-full text-xs sm:text-sm font-bold border border-emerald-500/20 mx-auto"
        >
          <Sparkles class="w-4 h-4" />
          سامانه هوشمند ثبت پروژه‌های نقشه‌برداری
        </span>

        <h1 class="text-1xl sm:text-3xl font-black leading-tight">
          ثبت آنلاین پروژه‌های
          <span class="text-emerald-400"> نقشه‌برداری </span>
          در چند دقیقه
        </h1>

        <p class="text-base sm:text-lg text-gray-200 leading-relaxed max-w-2xl mx-auto font-medium">
          محدوده پروژه را روی نقشه مشخص کنید، خدمات مورد نیاز را انتخاب کنید و در سریع‌ترین زمان
          پیش‌فاکتور و برآورد هزینه دریافت نمایید.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <router-link
            to="/signup"
            class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black transition text-center shadow-lg shadow-emerald-700/40"
          >
            شروع ثبت پروژه
          </router-link>

          <button
            class="w-full sm:w-auto border border-white/40 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition"
          >
            مشاهده خدمات
          </button>
        </div>

        <div
          class="flex justify-center gap-8 sm:gap-16 pt-8 border-t border-white/10 max-w-xl mx-auto"
        >
          <div>
            <div class="text-2xl sm:text-3xl font-black text-white">+250</div>
            <div class="text-xs text-gray-300 mt-1">پروژه انجام شده</div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-black text-white">98%</div>
            <div class="text-xs text-gray-300 mt-1">رضایت مشتریان</div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-black text-white">48h</div>
            <div class="text-xs text-gray-300 mt-1">پاسخ اولیه</div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 animate-bounce hidden sm:block">
        <div class="text-white/50 text-xs font-medium mb-1">اسکرول به پایین</div>
        <div class="w-5 h-8 border-2 border-white/30 rounded-full mx-auto flex justify-center pt-1">
          <div class="w-1 h-2 bg-white/60 rounded-full"></div>
        </div>
      </div>
    </section>

    <section class="py-20 bg-gray-50 relative z-40 shadow-inner">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-black text-gray-900">چرا این سامانه؟</h2>
          <p class="mt-4 text-gray-500">همه چیز برای مدیریت سریع پروژه‌های مهندسی</p>
        </div>

        <div class="grid md:grid-cols-4 gap-6">
          <div class="bg-white p-8 rounded-3xl shadow-sm">
            <Zap class="w-8 h-8 text-emerald-600 mb-4" />
            <h3 class="font-black mb-2">ثبت سریع</h3>
            <p class="text-sm text-gray-500">ثبت پروژه در کمتر از چند دقیقه</p>
          </div>

          <div class="bg-white p-8 rounded-3xl shadow-sm">
            <Calculator class="w-8 h-8 text-emerald-600 mb-4" />
            <h3 class="font-black mb-2">محاسبه خودکار</h3>
            <p class="text-sm text-gray-500">برآورد دقیق مساحت و هزینه</p>
          </div>

          <div class="bg-white p-8 rounded-3xl shadow-sm">
            <Plane class="w-8 h-8 text-emerald-600 mb-4" />
            <h3 class="font-black mb-2">پشتیبانی پهپاد</h3>
            <p class="text-sm text-gray-500">برداشت هوایی و فتوگرامتری</p>
          </div>

          <div class="bg-white p-8 rounded-3xl shadow-sm">
            <ShieldCheck class="w-8 h-8 text-emerald-600 mb-4" />
            <h3 class="font-black mb-2">امنیت اطلاعات</h3>
            <p class="text-sm text-gray-500">نگهداری امن داده‌های پروژه</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 relative z-40 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-black">خدمات قابل ارائه</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            class="group border rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all bg-white"
          >
            <Plane class="w-10 h-10 text-emerald-600 mb-4" />
            <h3 class="font-black text-lg mb-3">فتوگرامتری و پهپاد</h3>
            <p class="text-gray-500 leading-7">تولید ارتوفتو، مدل سه‌بعدی و نقشه‌های توپوگرافی.</p>
          </div>

          <div
            class="group border rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all bg-white"
          >
            <LocateFixed class="w-10 h-10 text-emerald-600 mb-4" />
            <h3 class="font-black text-lg mb-3">برداشت زمینی</h3>
            <p class="text-gray-500 leading-7">برداشت دقیق با GNSS و اتصال به سامانه شمیم.</p>
          </div>

          <div
            class="group border rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all bg-white"
          >
            <Building2 class="w-10 h-10 text-emerald-600 mb-4" />
            <h3 class="font-black text-lg mb-3">تفکیک آپارتمان‌ها</h3>
            <p class="text-gray-500 leading-7">تهیه نقشه‌های تفکیکی و صدور اسناد تک‌برگ.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-20 relative z-40">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-black">مراحل ثبت پروژه</h2>
        </div>

        <div class="grid md:grid-cols-4 gap-8">
          <div class="text-center">
            <div
              class="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto font-black"
            >
              1
            </div>
            <h3 class="mt-4 font-bold">اطلاعات اولیه</h3>
          </div>
          <div class="text-center">
            <div
              class="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto font-black"
            >
              2
            </div>
            <h3 class="mt-4 font-bold">ترسیم محدوده</h3>
          </div>
          <div class="text-center">
            <div
              class="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto font-black"
            >
              3
            </div>
            <h3 class="mt-4 font-bold">مشخصات فنی</h3>
          </div>
          <div class="text-center">
            <div
              class="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto font-black"
            >
              4
            </div>
            <h3 class="mt-4 font-bold">تایید نهایی</h3>
          </div>
        </div>
      </div>
    </section>
    <section class="py-24 relative z-40 bg-white">
      <div class="max-w-5xl mx-auto px-6">
        <div
          class="relative rounded-[32px] p-12 text-center text-white shadow-xl overflow-hidden bg-cover bg-center bg-no-repeat"
          :style="{ backgroundImage: `url(${ctaBg})` }"
        >
          <div class="absolute inset-0 bg-black/60 z-10"></div>

          <div class="relative z-20">
            <h2 class="text-3xl sm:text-4xl font-black">آماده شروع پروژه هستید؟</h2>

            <p class="mt-5 text-gray-200 font-medium">
              همین حالا پروژه خود را ثبت کنید و پیش‌فاکتور دریافت نمایید.
            </p>

            <router-link
              to="/signup"
              class="inline-block mt-8 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-950/30 transition"
            >
              ثبت پروژه جدید
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  Sparkles,
  Zap,
  Calculator,
  Plane,
  ShieldCheck,
  LocateFixed,
  Building2,
} from 'lucide-vue-next'
import ctaBg from '@/assets/cta-bg-map.png'
</script>
