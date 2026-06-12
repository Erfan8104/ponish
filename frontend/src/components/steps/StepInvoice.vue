<script setup lang="ts">
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()

// تبدیل آیدی دسته‌بندی‌ها به متن فارسی برای نمایش در فاکتور
const categoryMap: Record<string, string> = {
  terrestrial: 'نقشه‌برداری زمینی',
  uav: 'فتوگرامتری با پهپاد',
  gis: 'سامانه اطلاعات جغرافیایی (GIS)',
  cadastral: 'کاداستر و تفکیک اراضی',
}

// تبدیل آیدی دقت‌ها به متن فارسی
const accuracyMap: Record<string, string> = {
  'sub-cm': 'دقت میلی‌متری (کمتر از ۱ سانتی‌متر)',
  '1-5cm': 'دقت بالا (۱ تا ۵ سانتی‌متر)',
  '5-20cm': 'دقت متوسط (۵ تا ۲۰ سانتی‌متر)',
  'above-20cm': 'دقت عمومی (بالاتر از ۲۰ سانتی‌متر)',
}

// تبدیل آیدی زمان تحویل به متن فارسی
const deliveryMap: Record<string, string> = {
  urgent: 'بسیار فوری (کمتر از ۳ روز)',
  '1-week': 'معمول (۱ هفته)',
  '2-weeks': 'زمان‌دار (۲ هفته یا بیشتر)',
  custom: 'توافقی / سفارشی',
}

// فرمت‌دهی به اعداد ریال/تومان به سبک فارسی
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('fa-IR').format(val)
}
</script>

<template>
  <div class="space-y-8 text-right" style="direction: rtl">
    <div
      class="border border-gray-200/80 rounded-2xl p-6 bg-white shadow-sm space-y-4 max-w-2xl mx-auto"
    >
      <div class="flex items-center justify-between border-b border-gray-100 pb-3">
        <span class="text-[#008f55] bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
          {{ categoryMap[store.formData.category] || 'دسته‌بندی انتخاب نشده' }}
        </span>
        <span class="text-xs text-gray-400 font-medium tabular-nums">
          {{ store.formData.province }}، {{ store.formData.city }}
        </span>
      </div>

      <h3 class="text-base font-black text-gray-800">{{ store.formData.title || 'بدون عنوان' }}</h3>

      <p class="text-xs text-gray-500 leading-relaxed line-clamp-3">
        <span class="font-bold text-gray-700">توضیحات پروژه:</span>
        {{ store.formData.description || 'توضیحاتی وارد نشده است.' }}
      </p>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/70 p-3.5 rounded-xl text-xs text-gray-600"
      >
        <div>
          <span class="text-gray-400">مساحت اراضی:</span>
          <span class="font-bold text-gray-800 tabular-nums">
            {{
              store.formData.calculatedArea > 0
                ? `${store.formData.calculatedArea} هکتار`
                : 'نامشخص (آپلود فایل)'
            }}
          </span>
        </div>
        <div>
          <span class="text-gray-400">سیستم مختصات:</span>
          <span class="font-bold text-gray-800">
            {{ store.formData.coordinateSystem }}
            <span
              v-if="store.formData.coordinateSystem === 'UTM' && store.formData.utmZone"
              class="text-gray-500 font-normal"
            >
              (Zone {{ store.formData.utmZone }})
            </span>
          </span>
        </div>
        <div>
          <span class="text-gray-400">دقت هندسی:</span>
          <span class="font-bold text-gray-800">{{
            accuracyMap[store.formData.requiredAccuracy] || 'نامشخص'
          }}</span>
        </div>
        <div>
          <span class="text-gray-400">زمان تحویل:</span>
          <span class="font-bold text-gray-800">{{
            deliveryMap[store.formData.deliveryTime] || 'نامشخص'
          }}</span>
        </div>
      </div>

      <div
        v-if="store.formData.outputFormats.length > 0"
        class="flex flex-wrap gap-1.5 items-center text-xs text-gray-500 pt-2"
      >
        <span class="font-bold text-gray-600">فرمت‌های درخواستی:</span>
        <span
          v-for="fmt in store.formData.outputFormats"
          :key="fmt"
          class="bg-gray-100 border border-gray-200/60 rounded px-2.5 py-0.5 text-[11px] uppercase font-bold text-gray-700"
        >
          {{ fmt }}
        </span>
      </div>
    </div>

    <div class="max-w-2xl mx-auto pt-6 border-t border-gray-100">
      <h3 class="text-base font-black text-gray-800 mb-4">صورتحساب انتشار پروژه مهندسی</h3>

      <div class="space-y-4 text-xs font-bold text-gray-600">
        <div class="flex justify-between items-center">
          <span class="font-medium text-gray-500">حق اشتراک ثبت و سپردن پروژه به نقشه‌برداران</span>
          <span class="text-gray-800 tabular-nums"
            >{{ formatCurrency(store.baseProjectPrice) }} تومان</span
          >
        </div>

        <div class="flex justify-between items-center">
          <span class="font-medium text-gray-500">مالیات بر ارزش افزوده (۱۰٪)</span>
          <span class="text-gray-800 tabular-nums"
            >{{ formatCurrency(store.vatTaxAmount) }} تومان</span
          >
        </div>

        <div
          class="bg-gray-50 p-3.5 rounded-xl flex justify-between items-center text-xs text-gray-600"
        >
          <span>بودجه پیشنهادی شما به مجری:</span>
          <span
            v-if="store.formData.budgetType === 'custom'"
            class="text-gray-800 font-extrabold tabular-nums"
          >
            از {{ formatCurrency(Number(store.formData.minBudget)) }} تا
            {{ formatCurrency(Number(store.formData.maxBudget)) }} تومان
          </span>
          <span v-else class="text-amber-600 font-extrabold">توافقی (بر اساس مناقصه)</span>
        </div>

        <div class="border-t border-gray-100 my-2"></div>

        <div class="flex justify-between items-center text-sm font-black text-gray-900">
          <span>مبلغ نهایی قابل پرداخت پلتفرم:</span>
          <span class="text-lg font-black text-[#008f55] tabular-nums">
            {{ formatCurrency(store.totalInvoiceAmount) }}
            <span class="text-xs font-bold text-gray-500 mr-0.5">تومان</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
