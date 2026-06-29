<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '@/stores/project.store'

// ۱. نمونه‌سازی استور پینیا
const projectStore = useProjectStore()

// ۲. استخراج متغیرها به صورت ری‌اکتیو و ایمن (اصلاح نام error)
const { projects, isLoading, error } = storeToRefs(projectStore)

// ۳. فراخوانی اکشن دریافت پروژه‌ها از دیتابیس به محض لود شدن کامپوننت
onMounted(() => {
  projectStore.fetchProjects()
})
</script>
<template>
  <div class="p-6 bg-white rounded-xl shadow-md border border-gray-100 text-right" dir="rtl">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-lg font-bold text-gray-800">تست اتصال دیتابیس (لیست پروژه‌ها)</h2>
        <p class="text-xs text-gray-500 mt-1">نمایش مستقیم داده‌های جدول Project از PostgreSQL</p>
      </div>
      <button
        @click="projectStore.fetchProjects()"
        :disabled="isLoading"
        class="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {{ isLoading ? 'در حال به‌روزرسانی...' : 'بروزرسانی لیست' }}
      </button>
    </div>

    <div v-if="isLoading && projects.length === 0" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-if="error" class="p-4 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
      <p class="font-semibold">خطا در دریافت اطلاعات:</p>
      <p class="mt-1 text-xs">{{ error }}</p>
    </div>

    <div
      v-else-if="projects.length === 0"
      class="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <p class="mt-2 text-sm text-gray-500 font-medium">هیچ پروژه‌ای در پایگاه داده یافت نشد.</p>
    </div>

    <div v-else class="overflow-x-auto rounded-lg border border-gray-100">
      <table class="w-full text-sm text-gray-600">
        <thead class="bg-gray-50 text-gray-700 font-bold border-b border-gray-100">
          <tr>
            <th class="px-4 py-3 text-right">شناسه (ID)</th>
            <th class="px-4 py-3 text-right">عنوان پروژه</th>
            <th class="px-4 py-3 text-right">دسته‌بندی</th>
            <th class="px-4 py-3 text-right">موقعیت</th>
            <th class="px-4 py-3 text-right">مساحت</th>
            <th class="px-4 py-3 text-right">نوع بودجه</th>
            <th class="px-4 py-3 text-right">وضعیت</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="project in projects"
            :key="project.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3 font-mono text-xs text-gray-400">#{{ project.id }}</td>
            <td class="px-4 py-3 font-medium text-gray-900">{{ project.title }}</td>
            <td class="px-4 py-3">
              <span
                v-if="project.category"
                class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {{
                  typeof project.category === 'object'
                    ? project.category.name || project.category.slug
                    : project.category
                }}
              </span>
              <span v-else class="text-gray-400 text-xs">بدون دسته‌بندی</span>
            </td>
            <td class="px-4 py-3 text-xs">
              {{ project.province || '-' }}، {{ project.city || '-' }}
            </td>
            <td class="px-4 py-3 font-mono text-xs">{{ project.calculatedArea ?? '-' }}</td>
            <td class="px-4 py-3 text-xs">
              <span v-if="project.budgetType === 'fixed'">ثابت</span>
              <span v-else-if="project.budgetType === 'hourly'">ساعتی</span>
              <span v-else-if="project.budgetType === 'negotiable'">توافقی</span>
              <span v-else>{{ project.budgetType }}</span>
            </td>
            <td class="px-4 py-3">
              <span
                :class="{
                  'bg-yellow-50 text-yellow-700 border-yellow-200': project.status === 'draft',
                  'bg-green-50 text-green-700 border-green-200': project.status === 'open',
                  'bg-blue-50 text-blue-700 border-blue-200': project.status === 'in_progress',
                  'bg-gray-50 text-gray-700 border-gray-200': project.status === 'completed',
                  'bg-red-50 text-red-700 border-red-200': project.status === 'cancelled',
                }"
                class="px-2 py-1 text-xs font-medium rounded-md border"
              >
                {{ project.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
