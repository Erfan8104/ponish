<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
</script>

<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Video -->
    <video autoplay loop muted playsinline class="absolute inset-0 h-full w-full object-cover">
      <source src="@/assets/homepage.mp4" type="video/mp4" />
    </video>

    <!-- Overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-white/60" />

    <!-- Glow -->
    <div
      class="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-[140px]"
    />

    <!-- Content -->
    <div class="relative z-20 w-full px-4">
      <div
        class="mx-auto max-w-2xl rounded-3xl border border-white/20 bg-black/30 backdrop-blur-lg p-5 md:p-8 shadow-2xl"
      >
        <!-- Badge -->

        <div
          class="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5"
        >
          <Sparkles class="h-3.5 w-3.5 text-emerald-400" />

          <span class="text-xs font-semibold text-emerald-300"> سامانه هوشمند ژئوماتیک </span>
        </div>

        <!-- Title -->

        <h1 class="mt-5 text-2xl md:text-3xl lg:text-4xl font-black leading-relaxed text-white">
          آینده پروژه‌های

          <span
            class="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
          >
            نقشه‌برداری
          </span>

          و ژئوماتیک
        </h1>

        <!-- Description -->

        <p class="mt-4 text-sm md:text-base leading-7 text-slate-200">
          ارتباط مستقیم کارفرمایان و متخصصان حوزه نقشه‌برداری، GIS، فتوگرامتری و پهپاد در بستری
          حرفه‌ای و هوشمند.
        </p>

        <!-- Buttons -->

        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <router-link
            to="/signup"
            class="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white text-center transition hover:scale-105"
          >
            ثبت پروژه
          </router-link>

          <button
            class="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            مشاهده خدمات
          </button>
        </div>

        <!-- Stats -->

        <div class="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div class="rounded-xl border border-white/10 bg-white/10 p-4 text-center">
            <div class="text-2xl font-black text-white">+250</div>

            <div class="mt-1 text-xs text-slate-300">پروژه انجام شده</div>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/10 p-4 text-center">
            <div class="text-2xl font-black text-white">98%</div>

            <div class="mt-1 text-xs text-slate-300">رضایت مشتریان</div>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/10 p-4 text-center">
            <div class="text-2xl font-black text-white">48h</div>

            <div class="mt-1 text-xs text-slate-300">پاسخ اولیه</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
