<script setup lang="ts">
import { Map, Plane, Layers, Microscope, HardHat, Database } from 'lucide-vue-next'

const services = [
  { title: 'نقشه‌برداری زمینی', icon: Map, color: 'text-emerald-500' },
  { title: 'فتوگرامتری پهپاد', icon: Plane, color: 'text-cyan-500' },
  { title: 'سامانه GIS', icon: Layers, color: 'text-indigo-500' },
  { title: 'مدیریت داده', icon: Database, color: 'text-blue-500' },
]
</script>

<template>
  <section class="py-20 px-6 bg-white/30 backdrop-blur-sm">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-black text-slate-800">خدمات تخصصی ما</h2>
        <p class="text-slate-500 mt-2">هر آنچه در حوزه ژئوماتیک نیاز دارید</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="s in services"
          :key="s.title"
          class="group p-6 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-center"
        >
          <div class="flex justify-center mb-4">
            <component :is="s.icon" :class="['w-10 h-10', s.color]" />
          </div>
          <h3 class="text-sm font-bold text-slate-700">{{ s.title }}</h3>
        </div>
      </div>
    </div>
  </section>
</template>
