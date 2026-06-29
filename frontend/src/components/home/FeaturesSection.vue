<script setup lang="ts">
import { Zap, ShieldCheck, Sparkles } from 'lucide-vue-next'

const features = [
  {
    title: 'سرعت بالا',
    desc: 'ثبت و تایید پروژه در کمتر از یک ساعت',
    icon: Zap,
    color: 'text-yellow-500',
  },
  {
    title: 'ضمانت پرداخت',
    desc: 'امنیت کامل مالی برای طرفین قرارداد',
    icon: ShieldCheck,
    color: 'text-green-500',
  },
  {
    title: 'هوشمندی',
    desc: 'انتخاب بهترین متخصص بر اساس امتیاز',
    icon: Sparkles,
    color: 'text-cyan-500',
  },
]
</script>

<template>
  <section class="py-24 px-6">
    <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
      <div
        v-for="f in features"
        :key="f.title"
        class="p-10 rounded-[3rem] bg-white/60 backdrop-blur-xl border border-white shadow-xl hover:shadow-2xl transition-all"
      >
        <component :is="f.icon" :class="['w-10 h-10 mb-6', f.color]" />
        <h3 class="text-xl font-bold mb-3 text-slate-800">{{ f.title }}</h3>
        <p class="text-slate-500 leading-7">{{ f.desc }}</p>
      </div>
    </div>
  </section>
</template>
