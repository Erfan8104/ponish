<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface MenuItem {
  label: string
  path: string
  icon: string
}

const menuItems: MenuItem[] = [
  { label: 'داشبورد', path: '/admin/dashboard', icon: '📊' },
  { label: 'کاربران', path: '/admin/users', icon: '👥' },
  { label: 'پروژه‌ها', path: '/admin/projects', icon: '📁' },
  { label: 'پیشنهادها', path: '/admin/proposals', icon: '📝' },
  { label: 'قراردادها', path: '/admin/contracts', icon: '📄' },
  { label: 'پرداخت‌ها', path: '/admin/payments', icon: '💳' },
  { label: 'دسته‌بندی‌ها', path: '/admin/categories', icon: '🗂️' },
  { label: 'مهارت‌ها', path: '/admin/skills', icon: '🛠️' },
  { label: 'نظرات', path: '/admin/reviews', icon: '⭐' },
  { label: 'پیام‌ها', path: '/admin/messages', icon: '💬' },
  { label: 'فایل‌ها', path: '/admin/files', icon: '📎' },
  { label: 'گزارش‌ها', path: '/admin/reports', icon: '📈' },
  { label: 'لاگ فعالیت‌ها', path: '/admin/activity-logs', icon: '📋' },

  { label: 'تنظیمات', path: '/admin/settings', icon: '⚙️' },
]
</script>

<template>
  <aside
    class="w-64 h-screen bg-white border-l border-gray-100 flex flex-col shrink-0"
    style="direction: rtl"
  >
    <div class="h-16 flex items-center px-6 border-b border-gray-100">
      <span class="font-black text-lg text-[#008f55]">پنل مدیریت</span>
    </div>

    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        active-class="!bg-emerald-50 !text-[#008f55]"
      >
        <span class="text-base">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>
