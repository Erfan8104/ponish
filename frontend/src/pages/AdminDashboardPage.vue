<!-- src/pages/AdminDashboardPage.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import {
  Users,
  FolderKanban,
  Briefcase,
  FileText,
  ArrowLeft,
  UserCheck,
  UserX,
} from 'lucide-vue-next'

const adminStore = useAdminStore()

// داده‌های ساختگی (Mock Data) موقت برای فاز اول پروژه
const mockStats = ref({
  totalUsers: 148,
  totalProjects: 64,
  activeProjects: 12,
  totalContracts: 8,
})

const mockRecentUsers = ref([
  { id: 1, name: 'امیرحسین رضایی', phone: '09123456789', isActive: true, role: 'فریلنسر' },
  { id: 2, name: 'سارا کریمی', phone: '09187654321', isActive: true, role: 'کارفرما' },
  { id: 3, name: 'محمد علوی', phone: '09098765432', isActive: false, role: 'فریلنسر' },
  { id: 4, name: 'زهرا حسینی', phone: '09351112233', isActive: true, role: 'کارفرما' },
])
</script>

<template>
  <div class="space-y-6" style="direction: rtl">
    <!-- هدر صفحه داشبورد -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">داشبورد مدیریت</h1>
      <p class="text-sm text-gray-550 mt-1">خلاصه‌ای از وضعیت کلی پروژه ponisha-clone (فاز اول)</p>
    </div>

    <!-- کارت‌های آمار کلیدی -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- کارت کاربران -->
      <div
        class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
      >
        <div>
          <p class="text-sm text-gray-400 font-medium">کل کاربران</p>
          <h3 class="text-3xl font-bold text-gray-800 mt-2">{{ mockStats.totalUsers }}</h3>
        </div>
        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <Users class="w-6 h-6" />
        </div>
      </div>

      <!-- کارت کل پروژه‌ها -->
      <div
        class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
      >
        <div>
          <p class="text-sm text-gray-400 font-medium">کل پروژه‌ها</p>
          <h3 class="text-3xl font-bold text-gray-800 mt-2">{{ mockStats.totalProjects }}</h3>
        </div>
        <div
          class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"
        >
          <FolderKanban class="w-6 h-6" />
        </div>
      </div>

      <!-- کارت پروژه‌های فعال -->
      <div
        class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
      >
        <div>
          <p class="text-sm text-gray-400 font-medium">پروژه‌های فعال</p>
          <h3 class="text-3xl font-bold text-gray-800 mt-2">{{ mockStats.activeProjects }}</h3>
        </div>
        <div
          class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"
        >
          <Briefcase class="w-6 h-6" />
        </div>
      </div>

      <!-- کارت قراردادها -->
      <div
        class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
      >
        <div>
          <p class="text-sm text-gray-400 font-medium">کل قراردادها</p>
          <h3 class="text-3xl font-bold text-gray-800 mt-2">{{ mockStats.totalContracts }}</h3>
        </div>
        <div
          class="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"
        >
          <FileText class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- جدول کاربران اخیر -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900">آخرین کاربران ثبت‌نام شده</h2>
        <router-link
          to="/admin/users"
          class="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          مشاهده همه کاربران
          <ArrowLeft class="w-4 h-4" />
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-right border-collapse">
          <thead>
            <tr class="bg-gray-50/70 border-b border-gray-100 text-gray-500 text-xs font-semibold">
              <th class="px-6 py-4">نام و نام خانوادگی</th>
              <th class="px-6 py-4">شماره همراه</th>
              <th class="px-6 py-4">نقش کاربر</th>
              <th class="px-6 py-4">وضعیت حساب</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
            <tr
              v-for="user in mockRecentUsers"
              :key="user.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-6 py-4 font-medium text-gray-900">{{ user.name }}</td>
              <td class="px-6 py-4 font-mono text-gray-500">{{ user.phone }}</td>
              <td class="px-6 py-4">
                <span class="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                    user.isActive
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200',
                  ]"
                >
                  <component :is="user.isActive ? UserCheck : UserX" class="w-3.5 h-3.5" />
                  {{ user.isActive ? 'فعال' : 'مسدود' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
