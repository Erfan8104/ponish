<script setup lang="ts">
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()

// گزینه‌های زمان تحویل متناسب با پروژه‌های نقشه‌برداری
const deliveryOptions = [
  {
    id: 'urgent',
    title: '🔴 بسیار فوری (کمتر از ۳ روز)',
    desc: 'نیاز به اکیپ آماده و پردازش سریع',
  },
  { id: '1-week', title: '🟡 معمولی (۱ هفته)', desc: 'زمان استاندارد عملیات زمینی و کار دفتری' },
  {
    id: '2-weeks',
    title: '🟢 زمان‌دار (۲ هفته یا بیشتر)',
    desc: 'مناسب برای پروژه‌های بزرگ با حجم دیتای بالا',
  },
  { id: 'custom', title: '🔵 توافقی / سفارشی', desc: 'تعیین زمان پس از گفتگو با نقشه‌بردار' },
]

// مدیریت انتخاب و اضافه کردن فایل‌های ضمیمه مهندسی به استور پینیا
const handleAttachedFilesChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    store.addFiles(Array.from(target.files))
    target.value = '' // ریست کردن اینپوت برای دفعات بعدی
  }
}

// متد درگ اند دراپ فایل
const handleFileDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    store.addFiles(Array.from(event.dataTransfer.files))
  }
}
</script>

<template>
  <div class="space-y-6 text-right" style="direction: rtl">
    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3 mr-1"
        >۱. زمان‌بندی مد نظر شما برای تحویل خروجی‌ها چقدر است؟</label
      >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label
          v-for="time in deliveryOptions"
          :key="time.id"
          class="border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all bg-white"
          :class="
            store.formData.deliveryTime === time.id
              ? 'border-[#008f55] bg-emerald-50/10 ring-2 ring-emerald-50'
              : 'border-gray-200 hover:bg-gray-50/40'
          "
        >
          <div>
            <h4 class="text-xs font-bold text-gray-800">{{ time.title }}</h4>
            <p class="text-[10px] text-gray-400 mt-1">{{ time.desc }}</p>
          </div>
          <input
            type="radio"
            :value="time.id"
            v-model="store.formData.deliveryTime"
            class="accent-[#008f55] h-4 w-4"
          />
        </label>
      </div>
    </div>

    <hr class="border-gray-100 my-2" />

    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3 mr-1"
        >۲. بودجه پیشنهادی خود را برای این پروژه مشخص کنید</label
      >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <label
          class="border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all bg-white"
          :class="
            store.formData.budgetType === 'custom'
              ? 'border-[#008f55] ring-2 ring-emerald-50'
              : 'border-gray-200 hover:bg-gray-50/40'
          "
        >
          <span class="text-xs font-bold text-gray-700">تعیین بازه قیمت دلخواه (تومان)</span>
          <input
            type="radio"
            value="custom"
            v-model="store.formData.budgetType"
            class="accent-[#008f55] h-4 w-4"
          />
        </label>
        <label
          class="border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all bg-white"
          :class="
            store.formData.budgetType === 'agreement'
              ? 'border-[#008f55] ring-2 ring-emerald-50'
              : 'border-gray-200 hover:bg-gray-50/40'
          "
        >
          <span class="text-xs font-bold text-gray-700">توافقی (بر اساس پیشنهاد نقشه‌بردار)</span>
          <input
            type="radio"
            value="agreement"
            v-model="store.formData.budgetType"
            class="accent-[#008f55] h-4 w-4"
          />
        </label>
      </div>

      <div
        v-if="store.formData.budgetType === 'custom'"
        class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 animate-in"
      >
        <div>
          <label class="block text-[11px] font-bold text-gray-500 mb-1.5 mr-1"
            >حداقل بودجه پیشنهادی</label
          >
          <input
            v-model="store.formData.minBudget"
            type="number"
            placeholder="مثال: ۵,۰۰۰,۰۰۰"
            class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#008f55] outline-none"
          />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-gray-500 mb-1.5 mr-1"
            >حداکثر بودجه پیشنهادی</label
          >
          <input
            v-model="store.formData.maxBudget"
            type="number"
            placeholder="مثال: ۱۰,۰۰۰,۰۰۰"
            class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#008f55] outline-none"
          />
        </div>
      </div>
    </div>

    <hr class="border-gray-100 my-2" />

    <div>
      <label class="block text-xs font-bold text-gray-600 mb-2 mr-1"
        >۳. آپلود تصاویر زمین، اسناد یا کروکی (اختیاری)</label
      >
      <div
        @dragover.prevent
        @drop.prevent="handleFileDrop"
        class="border border-dashed border-gray-200 bg-gray-50/40 rounded-xl p-6 text-center"
      >
        <input
          type="file"
          id="technical-attachments-input"
          multiple
          class="hidden"
          @change="handleAttachedFilesChange"
        />
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-right sm:order-1 order-2">
            <p class="text-[11px] text-gray-500 font-medium mb-1">
              فایل‌های مکمل پروژه (PDF, JPG, PNG, DWG) را اینجا رها کنید.
            </p>
            <p class="text-[10px] text-gray-400">حداکثر حجم هر فایل: ۱۵ مگابایت</p>
          </div>
          <button
            type="button"
            @click="() => document.getElementById('technical-attachments-input')?.click()"
            class="bg-white border border-gray-200 text-gray-700 text-[11px] font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50"
          >
            آپلود فایل ضمیمه
          </button>
        </div>

        <div v-if="store.uploadedFiles.length > 0" class="mt-5 text-right flex flex-wrap gap-2">
          <div
            v-for="(file, idx) in store.uploadedFiles"
            :key="idx"
            class="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg pl-2 pr-3 py-1.5 text-[11px] text-gray-700 shadow-sm"
          >
            <span class="font-medium truncate max-w-[150px]">{{ file.name }}</span>
            <button
              type="button"
              @click="store.removeFile(idx)"
              class="text-red-400 hover:text-red-600 font-bold mr-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
