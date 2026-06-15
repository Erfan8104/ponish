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
  <div class="bg-white rounded-2xl p-6 border border-gray-200">
    <h2 class="text-xl font-bold text-gray-800 mb-6">عملیات سریع</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button
        v-for="action in quickActions"
        :key="action.label"
        @click="action.action"
        :class="`${action.color} ${action.textColor} rounded-xl p-4 transition-all duration-200 hover:shadow-lg transform hover:scale-105`"
      >
        <div class="text-3xl mb-2">{{ action.icon }}</div>
        <p class="font-bold text-sm">{{ action.label }}</p>
        <p class="text-xs opacity-70 mt-1">{{ action.description }}</p>
      </button>
    </div>
  </div>
</template>
