<script setup lang="ts">
const stats = [
  { label: 'پروژه موفق', value: '+۱,۲۰۰' },
  { label: 'متخصص تایید شده', value: '+۴۵۰' },
  { label: 'استان فعال', value: '۳۱' },
  { label: 'رضایت کاربران', value: '۹۸٪' },
]
</script>

<template>
  <div class="py-12 px-6">
    <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="p-6 rounded-3xl bg-white/50 backdrop-blur-lg border border-white/60 text-center shadow-sm"
      >
        <div class="text-3xl font-black text-emerald-600 mb-1">{{ stat.value }}</div>
        <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">
          {{ stat.label }}
        </div>
      </div>
    </div>
  </div>
</template>
