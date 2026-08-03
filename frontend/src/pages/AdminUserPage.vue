<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllUsersApi } from '@/services/admin.service'
import {
  useVueTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  FlexRender,
} from '@tanstack/vue-table'

const users = ref<any[]>([])
const loading = ref(true)
const globalFilter = ref('')

// دریافت داده‌ها از سرور
// دریافت داده‌ها از سرور
onMounted(async () => {
  try {
    const data = await getAllUsersApi()
    if (data.success) {
      users.value = data.users
    }
  } catch (error) {
    console.error('خطا در دریافت کاربران:', error)
  } finally {
    loading.value = false
  }
})

// تعریف ستون‌های جدول با TanStack Table
const columns = [
  {
    accessorKey: 'name',
    header: 'نام و نام خانوادگی',
    cell: (info: any) => info.getValue() || 'تکمیل نشده',
  },
  {
    accessorKey: 'phone',
    header: 'شماره تماس',
  },
  {
    accessorKey: 'email',
    header: 'ایمیل',
    cell: (info: any) => info.getValue() || 'ثبت نشده',
  },
  {
    accessorKey: 'role',
    header: 'نقش کاربر',
    cell: (info: any) => {
      const role = info.getValue()
      if (role === 'admin') return 'مدیر کل'
      if (role === 'employer') return 'کارفرما'
      if (role === 'freelancer') return 'فریلنسر'
      return 'نامشخص'
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'تاریخ عضویت',
    cell: (info: any) => {
      const date = info.getValue()
      return date ? new Date(date).toLocaleDateString('fa-IR') : '-'
    },
  },
]

// راه‌اندازی TanStack Table
const table = useVueTable({
  get data() {
    return users.value
  },
  get columns() {
    return columns
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    get globalFilter() {
      return globalFilter.value
    },
  },
  onGlobalFilterChange: (val) => {
    globalFilter.value = val
  },
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-6xl mx-auto">
      <!-- هدر بخش کاربران -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 class="text-xl font-bold text-gray-900">مدیریت کاربران</h1>
          <p class="text-xs text-gray-400 mt-1">فهرست تمام کاربران ثبت‌نام شده در پلتفرم پونیشا</p>
        </div>

        <!-- باکس جستجوی زنده -->
        <div class="w-full md:w-72">
          <input
            v-model="globalFilter"
            type="text"
            placeholder="جستجو در کاربران..."
            class="w-full h-10 px-4 bg-white border border-gray-200 rounded-xl text-xs focus:border-[#008f55] outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <!-- جدول داده‌ها -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div v-if="loading" class="text-center py-16 text-xs text-gray-400">
          در حال بارگذاری لیست کاربران...
        </div>

        <div v-else-if="users.length === 0" class="text-center py-16 text-xs text-gray-400">
          هیچ کاربری یافت نشد.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-right border-collapse">
            <thead>
              <tr
                class="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500"
              >
                <th v-for="header in table.getFlatHeaders()" :key="header.id" class="px-6 py-4">
                  <FlexRender
                    v-if="!header.isPlaceholder"
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-xs text-gray-600">
              <tr
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                class="hover:bg-gray-50/50 transition-colors"
              >
                <td
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="px-6 py-4 font-medium"
                >
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- فوتر جدول و صفحه‌بندی (Pagination) -->
        <div
          class="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100 text-xs"
        >
          <span class="text-gray-400">
            صفحه {{ table.getState().pagination.pageIndex + 1 }} از {{ table.getPageCount() }}
          </span>

          <div class="flex gap-2">
            <button
              @click="table.previousPage()"
              :disabled="!table.getCanPreviousPage()"
              class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              قبلی
            </button>
            <button
              @click="table.nextPage()"
              :disabled="!table.getCanNextPage()"
              class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              بعدی
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
