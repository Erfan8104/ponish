<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()

// استخراج عدد از داخل رشته ذخیره شده در استور (مثلاً "10 روز" -> "10")
const getInitialCustomDays = () => {
  if (!store.formData.deliveryTime) return ''
  const staticOptions = ['urgent', '3-days', '1-week', '2-weeks']
  if (staticOptions.includes(store.formData.deliveryTime)) return ''
  const match = store.formData.deliveryTime.match(/\d+/)
  return match ? match[0] : store.formData.deliveryTime
}

// بررسی اینکه آیا مقدار اولیه تحویل جزو گزینه‌های ثابت است یا کاربر روز دستی وارد کرده است
const isCustomDays = ref(
  !['urgent', '3-days', '1-week', '2-weeks'].includes(store.formData.deliveryTime || '') &&
    Boolean(store.formData.deliveryTime),
)

const customDaysInput = ref(getInitialCustomDays())

const deliveryOptions = [
  {
    id: 'urgent',
    title: 'فوری',
    desc: 'تحویل کمتر از ۴۸ ساعت',
    multiplier: 1.5,
  },
  {
    id: '3-days',
    title: '۳ روز',
    desc: 'تحویل سریع',
    multiplier: 1.25,
  },
  {
    id: '1-week',
    title: '۱ هفته',
    desc: 'حالت استاندارد',
    multiplier: 1,
  },
  {
    id: '2-weeks',
    title: 'بیش از یک هفته',
    desc: 'کمترین هزینه',
    multiplier: 0.9,
  },
  {
    id: 'custom',
    title: 'تعداد روز دلخواه',
    desc: 'وارد کردن دقیق مدت زمان به روز',
    multiplier: 1,
  },
]

const budgetModes = [
  {
    id: 'fixed',
    title: 'بودجه دلخواه (ثابت)',
  },
  {
    id: 'negotiable',
    title: 'قیمت توافقی',
  },
]

// مدیریت انتخاب زمان تحویل
const selectDelivery = (id: string) => {
  if (id === 'custom') {
    isCustomDays.value = true
    store.formData.deliveryTime = customDaysInput.value ? `${customDaysInput.value} روز` : ''
  } else {
    isCustomDays.value = false
    customDaysInput.value = ''
    store.formData.deliveryTime = id
  }
}

// آپدیت مقدار در صورت تغییر اینپوت دستی روز
watch(customDaysInput, (newVal) => {
  if (isCustomDays.value) {
    store.formData.deliveryTime = newVal ? `${newVal} روز` : ''
  }
})

// مدیریت تغییر نحوه بودجه‌بندی (اگر توافقی انتخاب شد، بودجه‌ها صفر شوند)
const selectBudgetMode = (modeId: string) => {
  store.formData.budgetType = modeId as 'fixed' | 'negotiable'
  if (modeId === 'negotiable') {
    store.formData.minBudget = '0'
    store.formData.maxBudget = '0'
  }
}

onMounted(() => {
  // اگر مقدار پیش‌فرضی از قبل هست و custom انتخاب شده، مقدار اینپوت ست شود
  if (isCustomDays.value && !customDaysInput.value) {
    store.formData.deliveryTime = ''
  }
})
</script>

<template>
  <div class="space-y-8 text-right" style="direction: rtl">
    <!-- زمان تحویل -->
    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3">
        زمان تحویل مورد انتظار <span class="text-red-500">*</span>
      </label>

      <div class="grid md:grid-cols-2 gap-3">
        <button
          v-for="item in deliveryOptions"
          :key="item.id"
          type="button"
          @click="selectDelivery(item.id)"
          class="border rounded-xl p-4 text-right transition-all"
          :class="
            (item.id === 'custom' && isCustomDays) || store.formData.deliveryTime === item.id
              ? 'border-[#008f55] bg-emerald-50'
              : 'border-gray-200'
          "
        >
          <div class="font-bold text-sm">
            {{ item.title }}
          </div>

          <div class="text-xs text-gray-500 mt-1">
            {{ item.desc }}
          </div>
        </button>
      </div>

      <!-- اینپوت تعداد روز دستی (در صورت انتخاب گزینه روز دلخواه) -->
      <div v-if="isCustomDays" class="mt-4">
        <label class="block text-xs font-bold text-gray-600 mb-2">
          مدت زمان تحویل (به روز) <span class="text-red-500">*</span>
        </label>
        <input
          v-model="customDaysInput"
          type="number"
          min="1"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#008f55]"
          placeholder="مثال: ۱۰"
        />
        <p v-if="!customDaysInput" class="text-red-500 text-[11px] mt-1.5">
          لطفاً تعداد روز را به صورت عددی وارد کنید.
        </p>
      </div>
    </div>

    <!-- بودجه -->
    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3"> نحوه بودجه‌بندی </label>

      <div class="flex gap-3">
        <button
          v-for="mode in budgetModes"
          :key="mode.id"
          type="button"
          @click="selectBudgetMode(mode.id)"
          class="px-5 py-3 rounded-xl border text-sm font-bold transition-all"
          :class="
            store.formData.budgetType === mode.id
              ? 'bg-[#008f55] text-white border-[#008f55]'
              : 'bg-white border-gray-200'
          "
        >
          {{ mode.title }}
        </button>
      </div>
    </div>

    <!-- بودجه دلخواه (فقط در حالت fixed نمایش داده می‌شود) -->
    <div v-if="store.formData.budgetType === 'fixed'" class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-gray-600 mb-2"> حداقل بودجه </label>

        <input
          v-model="store.formData.minBudget"
          type="number"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#008f55]"
          placeholder="مثال: ۲۰ میلیون"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-600 mb-2"> حداکثر بودجه </label>

        <input
          v-model="store.formData.maxBudget"
          type="number"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#008f55]"
          placeholder="مثال: ۵۰ میلیون"
        />
      </div>
    </div>
  </div>
</template>
