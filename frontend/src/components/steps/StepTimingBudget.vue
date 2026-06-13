<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()

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
]

const budgetModes = [
  {
    id: 'custom',
    title: 'بودجه دلخواه',
  },
  {
    id: 'open',
    title: 'استعلام قیمت',
  },
]

const estimatedPrice = computed(() => {
  let area = Number(store.formData.calculatedArea || 0)

  if (!area) return 0

  let basePrice = area * 2500000

  if (store.formData.category === 'uav') basePrice *= 1.2

  if (store.formData.category === 'gis') basePrice *= 0.8

  if (store.formData.category === 'cadastral') basePrice *= 1.5

  if (store.formData.requiredAccuracy === '1-2cm') basePrice *= 1.4

  if (store.formData.requiredAccuracy === '2-5cm') basePrice *= 1.2

  const delivery = deliveryOptions.find((d) => d.id === store.formData.deliveryTime)

  if (delivery) basePrice *= delivery.multiplier

  return Math.round(basePrice)
})

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('fa-IR').format(value)
}
</script>

<template>
  <div class="space-y-8 text-right" style="direction: rtl">
    <!-- زمان تحویل -->

    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3"> زمان تحویل مورد انتظار </label>

      <div class="grid md:grid-cols-2 gap-3">
        <button
          v-for="item in deliveryOptions"
          :key="item.id"
          type="button"
          @click="store.formData.deliveryTime = item.id"
          class="border rounded-xl p-4 text-right transition-all"
          :class="
            store.formData.deliveryTime === item.id
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
    </div>

    <!-- بودجه -->

    <div>
      <label class="block text-xs font-bold text-gray-600 mb-3"> نحوه بودجه‌بندی </label>

      <div class="flex gap-3">
        <button
          v-for="mode in budgetModes"
          :key="mode.id"
          type="button"
          @click="store.formData.budgetType = mode.id"
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

    <!-- بودجه دلخواه -->

    <div v-if="store.formData.budgetType === 'custom'" class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-gray-600 mb-2"> حداقل بودجه </label>

        <input
          v-model="store.formData.minBudget"
          type="number"
          class="w-full border border-gray-200 rounded-xl px-4 py-3"
          placeholder="مثال: ۲۰ میلیون"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-600 mb-2"> حداکثر بودجه </label>

        <input
          v-model="store.formData.maxBudget"
          type="number"
          class="w-full border border-gray-200 rounded-xl px-4 py-3"
          placeholder="مثال: ۵۰ میلیون"
        />
      </div>
    </div>

    <!-- تخمین هوشمند -->

    <div v-if="estimatedPrice" class="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs text-gray-500">برآورد اولیه سامانه</div>

          <div class="text-lg font-black text-[#008f55] mt-1">
            {{ formatPrice(estimatedPrice) }}
            تومان
          </div>
        </div>

        <div class="text-3xl">💰</div>
      </div>

      <p class="text-xs text-gray-500 mt-3 leading-6">
        این مبلغ صرفاً یک تخمین اولیه بر اساس مساحت، نوع پروژه، دقت مورد نیاز و زمان تحویل است و
        قیمت نهایی توسط مجری تعیین خواهد شد.
      </p>
    </div>
  </div>
</template>
