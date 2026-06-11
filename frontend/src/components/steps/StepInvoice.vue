<script setup lang="ts">
import { useProjectStore } from '../../stores/project.store'
const store = useProjectStore()
const formatCurrency = (val: number) => new Intl.NumberFormat('fa-IR').format(val)
</script>

<template>
  <div class="space-y-10" style="direction: rtl">
    <div
      class="border border-gray-200/80 rounded-2xl p-6 bg-white shadow-sm space-y-4 max-w-2xl mx-auto"
    >
      <div class="text-[#008f55] font-bold text-sm">
        {{ store.formData.category || 'تصویر سازی' }}
      </div>
      <h3 class="text-base font-bold text-gray-800">{{ store.formData.title || 'بدون عنوان' }}</h3>

      <div
        v-if="store.formData.skills.length > 0"
        class="flex flex-wrap gap-1.5 items-center text-xs text-gray-500"
      >
        <span>مهارت‌ها:</span>
        <span
          v-for="s in store.formData.skills"
          :key="s"
          class="bg-gray-50 border border-gray-100 rounded px-2 py-0.5 text-[11px]"
          >{{ s }}</span
        >
      </div>

      <div class="pt-2 flex items-center gap-1.5 text-xs font-bold text-amber-600">
        <span
          >اولویت:
          {{
            store.formData.priority === 'price'
              ? 'قیمت اهمیت دارد'
              : store.formData.priority === 'quality'
                ? 'کیفیت اهمیت دارد'
                : 'ترکیب کیفیت و قیمت'
          }}</span
        >
      </div>
    </div>

    <div class="max-w-2xl mx-auto pt-4 border-t border-gray-100">
      <h3 class="text-lg font-bold text-gray-800 mb-6">صورتحساب</h3>
      <div class="space-y-4 text-sm font-medium text-gray-600">
        <div class="flex justify-between items-center">
          <span>ایجاد پروژه</span>
          <span class="font-bold text-gray-800"
            >{{ formatCurrency(store.baseProjectPrice) }} تومان</span
          >
        </div>
        <div class="flex justify-between items-center">
          <span>مالیات بر ارزش افزوده</span>
          <span class="font-bold text-gray-800"
            >{{ formatCurrency(store.vatTaxAmount) }} تومان</span
          >
        </div>
        <div class="border-t border-gray-100 my-2"></div>
        <div class="flex justify-between items-center text-base font-bold text-gray-900">
          <span>مبلغ قابل پرداخت</span>
          <span class="text-xl font-black text-gray-900"
            >{{ formatCurrency(store.totalInvoiceAmount) }} تومان</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
