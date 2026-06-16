<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const quickActions = [
  {
    icon: '➕',
    label: 'پروژه جدید',
    description: 'ایجاد پروژه جدید',
    action: () => router.push({ name: 'new-project' }),
    color: 'bg-blue-50 hover:bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    icon: '📋',
    label: 'مشاهده پروژه‌ها',
    description: 'مشاهده تمام پروژه‌ها',
    action: () => router.push({ name: 'projects' }),
    color: 'bg-green-50 hover:bg-green-100',
    textColor: 'text-green-600',
  },
  {
    icon: '📊',
    label: 'گزارش‌ها',
    description: 'مشاهده آمار و گزارش‌ها',
    action: () => {},
    color: 'bg-purple-50 hover:bg-purple-100',
    textColor: 'text-purple-600',
  },
  {
    icon: '⚙️',
    label: 'تنظیمات',
    description: 'تنظیمات حساب کاربری',
    action: () => router.push({ name: 'profile' }),
    color: 'bg-orange-50 hover:bg-orange-100',
    textColor: 'text-orange-600',
  },
]
</script>

<template>
  <div class="bg-white rounded-[28px] p-6 shadow-sm shadow-slate-200/70">
    <div class="mb-6 flex items-center justify-between gap-3">
      <h2 class="text-xl font-semibold text-slate-900">عملیات سریع</h2>
      <p class="text-sm text-slate-500">دسترسی به مهم‌ترین بخش‌ها با یک کلیک</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button
        v-for="action in quickActions"
        :key="action.label"
        @click="action.action"
        :class="`${action.color} ${action.textColor} rounded-3xl p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg`"
      >
        <div
          class="mb-4 flex h-12 w-12 items-center justify-center rounded-3xl bg-white/90 text-2xl shadow-sm"
        >
          {{ action.icon }}
        </div>
        <p class="font-semibold text-sm">{{ action.label }}</p>
        <p class="mt-1 text-xs text-slate-500">{{ action.description }}</p>
      </button>
    </div>
  </div>
</template>
