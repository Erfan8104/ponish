<script setup lang="ts">
import {
  Briefcase,
  UserCheck,
  Map,
  Globe2,
  Plane,
  Building2,
  Compass,
  Layers,
} from 'lucide-vue-next'

const services = [
  { title: 'نقشه‌برداری زمینی', icon: Map },
  { title: 'GIS', icon: Globe2 },
  { title: 'پهپاد', icon: Plane },
  { title: 'تفکیک املاک', icon: Building2 },
  { title: 'UTM', icon: Compass },
  { title: 'توپوگرافی', icon: Layers },
]
</script>

<template>
  <section class="relative py-28 bg-slate-50">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Header -->

      <div class="text-center max-w-3xl mx-auto">
        <span
          class="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-4 py-2 text-sm font-bold"
        >
          پلتفرم تخصصی ژئوماتیک
        </span>

        <h2 class="mt-6 text-4xl md:text-5xl font-black text-slate-900 leading-tight">
          ارتباط مستقیم
          <span class="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            کارفرمایان
          </span>
          و متخصصان
        </h2>

        <p class="mt-6 text-lg text-slate-600 leading-9">
          بستری هوشمند برای ثبت پروژه‌های نقشه‌برداری، GIS، فتوگرامتری و خدمات پهپادی.
        </p>
      </div>

      <!-- Employer + Expert -->

      <div class="grid lg:grid-cols-2 gap-8 mt-20">
        <!-- Employer -->

        <div
          class="group bg-white rounded-[32px] p-10 border border-slate-200 shadow-lg shadow-slate-200/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-500"
        >
          <div class="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Briefcase class="w-8 h-8 text-emerald-600" />
          </div>

          <h3 class="mt-8 text-2xl font-black text-slate-900">برای کارفرمایان</h3>

          <p class="mt-4 text-slate-600 leading-8">
            پروژه خود را ثبت کنید و از متخصصان معتبر پیشنهاد قیمت دریافت نمایید.
          </p>

          <ul class="mt-8 space-y-3 text-slate-700">
            <li>✓ ثبت سریع پروژه</li>
            <li>✓ دریافت پیشنهاد قیمت</li>
            <li>✓ انتخاب بهترین متخصص</li>
          </ul>
        </div>

        <!-- Expert -->

        <div
          class="group bg-white rounded-[32px] p-10 border border-slate-200 shadow-lg shadow-slate-200/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-500"
        >
          <div class="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center">
            <UserCheck class="w-8 h-8 text-cyan-600" />
          </div>

          <h3 class="mt-8 text-2xl font-black text-slate-900">برای متخصصان</h3>

          <p class="mt-4 text-slate-600 leading-8">
            پروژه‌های جدید دریافت کنید و کسب‌وکار حرفه‌ای خود را توسعه دهید.
          </p>

          <ul class="mt-8 space-y-3 text-slate-700">
            <li>✓ دریافت پروژه جدید</li>
            <li>✓ ارسال پیشنهاد</li>
            <li>✓ رزومه تخصصی</li>
          </ul>
        </div>
      </div>

      <!-- Services -->

      <div class="mt-28">
        <div class="text-center">
          <h3 class="text-3xl font-black text-slate-900">خدمات سامانه</h3>

          <p class="mt-3 text-slate-500">پرکاربردترین خدمات حوزه ژئوماتیک</p>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div
            v-for="service in services"
            :key="service.title"
            class="group bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-md hover:-translate-y-2 hover:border-emerald-300 hover:shadow-xl transition-all duration-500"
          >
            <component :is="service.icon" class="w-8 h-8 mx-auto text-emerald-600" />

            <h4 class="mt-5 font-bold text-slate-800">
              {{ service.title }}
            </h4>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
