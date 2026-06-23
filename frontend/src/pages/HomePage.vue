<script setup lang="ts">
import {
  Sparkles,
  Zap,
  Calculator,
  Plane,
  ShieldCheck,
  LocateFixed,
  Building2,
  Upload,
  Users,
  Briefcase,
  UserCheck,
  ArrowLeftRight,
  Map,
  Compass,
  Cpu,
  Layers,
  Globe2,
} from 'lucide-vue-next'

import ctaBg from '@/assets/cta-bg-map.png'
</script>

<template>
  <div class="bg-white min-h-screen text-right" dir="rtl">
    <!-- HERO -->
    <section class="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <video
        autoplay
        loop
        muted
        playsinline
        class="absolute z-10 w-auto min-w-full min-h-full max-w-none object-cover"
      >
        <source src="@/assets/homepage.mp4" type="video/mp4" />
      </video>

      <div class="absolute inset-0 bg-black/60 z-20"></div>

      <div class="relative z-30 max-w-4xl mx-auto px-6 text-center text-white space-y-6">
        <span
          class="inline-flex items-center gap-2 bg-emerald-600/30 backdrop-blur-sm text-emerald-300 px-4 py-2 rounded-full text-xs sm:text-sm font-bold border border-emerald-500/20 mx-auto"
        >
          <Sparkles class="w-4 h-4" />
          سامانه هوشمند نقشه
        </span>

        <div class="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <router-link
            to="/signup"
            class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition text-sm text-center shadow-lg shadow-emerald-700/40"
          >
            ثبت پروژه
          </router-link>

          <button
            class="w-full sm:w-auto border border-white/40 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition text-sm"
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
    </section>

    <!-- معرفی پلتفرم -->
    <section class="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span
            class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200/50 mb-4"
          >
            <Users class="w-3.5 h-3.5" />
            اکوسیستم تخصصی ژئوماتیک
          </span>

          <h2 class="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            پل ارتباطی کارفرمایان و متخصصان نقشه‌برداری
          </h2>

          <p class="mt-6 text-slate-600 leading-8 text-base sm:text-lg">
            این سامانه بستری برای ارتباط مستقیم کارفرمایان و متخصصان حوزه نقشه‌برداری، ژئوماتیک، GIS
            و فتوگرامتری فراهم می‌کند تا پروژه‌ها سریع‌تر و با کیفیت بالاتر اجرا شوند.
          </p>
        </div>

        <!-- دو کارت -->
        <div class="grid md:grid-cols-2 gap-8 mb-20">
          <!-- کارفرما -->
          <div class="bg-white rounded-3xl p-8 border shadow-sm">
            <div
              class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6"
            >
              <Briefcase class="w-6 h-6" />
            </div>

            <h3 class="text-xl font-bold mb-4">برای کارفرمایان</h3>

            <p class="text-slate-500 text-sm leading-7 mb-6">
              ثبت پروژه و دریافت پیشنهاد از متخصصان تایید شده در کوتاه‌ترین زمان.
            </p>

            <ul class="space-y-3 text-sm text-slate-600">
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                ثبت سریع پروژه
              </li>

              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                دریافت پیشنهاد قیمت
              </li>

              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                انتخاب متخصص مناسب
              </li>
            </ul>
          </div>

          <!-- متخصص -->
          <div class="bg-white rounded-3xl p-8 border shadow-sm">
            <div
              class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6"
            >
              <UserCheck class="w-6 h-6" />
            </div>

            <h3 class="text-xl font-bold mb-4">برای متخصصان</h3>

            <p class="text-slate-500 text-sm leading-7 mb-6">
              دسترسی به پروژه‌های جدید و توسعه شبکه حرفه‌ای در حوزه نقشه‌برداری.
            </p>

            <ul class="space-y-3 text-sm text-slate-600">
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                دریافت پروژه‌های جدید
              </li>

              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                ارسال پیشنهاد قیمت
              </li>

              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                ساخت رزومه حرفه‌ای
              </li>
            </ul>
          </div>
        </div>

        <!-- خدمات -->
        <div>
          <h3 class="text-lg font-bold text-center mb-10 flex items-center justify-center gap-2">
            <ArrowLeftRight class="w-5 h-5 text-emerald-600" />
            خدمات قابل ارائه
          </h3>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="flex items-center gap-3 bg-white p-4 rounded-xl border">
              <Map class="w-5 h-5 text-slate-600" />
              <span class="text-sm font-semibold">نقشه‌برداری زمینی</span>
            </div>

            <div class="flex items-center gap-3 bg-white p-4 rounded-xl border">
              <Building2 class="w-5 h-5 text-slate-600" />
              <span class="text-sm font-semibold">تفکیک املاک</span>
            </div>

            <div class="flex items-center gap-3 bg-white p-4 rounded-xl border">
              <Compass class="w-5 h-5 text-slate-600" />
              <span class="text-sm font-semibold">نقشه UTM</span>
            </div>

            <div class="flex items-center gap-3 bg-white p-4 rounded-xl border">
              <Layers class="w-5 h-5 text-slate-600" />
              <span class="text-sm font-semibold">توپوگرافی</span>
            </div>

            <div class="flex items-center gap-3 bg-white p-4 rounded-xl border">
              <Plane class="w-5 h-5 text-slate-600" />
              <span class="text-sm font-semibold">پهپاد</span>
            </div>

            <div class="flex items-center gap-3 bg-white p-4 rounded-xl border">
              <Cpu class="w-5 h-5 text-slate-600" />
              <span class="text-sm font-semibold">پردازش داده</span>
            </div>

            <div class="flex items-center gap-3 bg-white p-4 rounded-xl border">
              <Globe2 class="w-5 h-5 text-slate-600" />
              <span class="text-sm font-semibold">GIS</span>
            </div>

            <div class="flex items-center gap-3 bg-white p-4 rounded-xl border">
              <LocateFixed class="w-5 h-5 text-slate-600" />
              <span class="text-sm font-semibold">امور ثبتی</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-black text-gray-900">چرا این سامانه؟</h2>
        </div>

        <div class="grid md:grid-cols-4 gap-6">
          <div class="bg-white p-8 rounded-3xl shadow-sm">
            <Zap class="w-8 h-8 text-emerald-600 mb-4" />
            <h3 class="font-black mb-2">ثبت سریع</h3>
          </div>

          <div class="bg-white p-8 rounded-3xl shadow-sm">
            <Calculator class="w-8 h-8 text-emerald-600 mb-4" />
            <h3 class="font-black mb-2">محاسبه خودکار</h3>
          </div>

          <div class="bg-white p-8 rounded-3xl shadow-sm">
            <Upload class="w-8 h-8 text-emerald-600 mb-4" />
            <h3 class="font-black mb-2">انتشار پروژه</h3>
          </div>

          <div class="bg-white p-8 rounded-3xl shadow-sm">
            <ShieldCheck class="w-8 h-8 text-emerald-600 mb-4" />
            <h3 class="font-black mb-2">امنیت اطلاعات</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 bg-white">
      <div class="max-w-5xl mx-auto px-6">
        <div
          class="relative rounded-3xl p-12 text-center text-white shadow-xl overflow-hidden bg-cover bg-center"
          :style="{ backgroundImage: `url(${ctaBg})` }"
        >
          <div class="absolute inset-0 bg-black/60"></div>

          <div class="relative z-10">
            <h2 class="text-3xl sm:text-4xl font-black">آماده شروع پروژه هستید؟</h2>

            <p class="mt-5 text-gray-200">همین حالا پروژه خود را ثبت کنید.</p>

            <router-link
              to="/signup"
              class="inline-block mt-8 bg-emerald-600 hover:bg-emerald-700 px-8 py-4 rounded-2xl font-black"
            >
              ثبت پروژه
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
