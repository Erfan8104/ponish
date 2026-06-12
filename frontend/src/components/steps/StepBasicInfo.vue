<script setup lang="ts">
import { useProjectStore } from '../../stores/project.store'
const store = useProjectStore()
</script>

<template>
  <div class="relative text-right" style="direction: rtl">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <label
        v-for="type in [
          { id: 'price', t: 'قیمت بالاترین اهمیت را دارد' },
          { id: 'quality', t: 'کیفیت بالاترین اهمیت را دارد' },
          { id: 'balanced', t: 'ترکیبی از کیفیت و قیمت' },
        ]"
        :key="type.id"
        class="border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all"
        :class="
          store.formData.priority === type.id
            ? 'border-[#008f55] bg-emerald-50/20 ring-2 ring-emerald-50'
            : 'border-gray-200 bg-white hover:bg-gray-50'
        "
      >
        <span class="text-xs font-bold text-gray-700">{{ type.t }}</span>
        <input
          type="radio"
          :value="type.id"
          v-model="store.formData.priority"
          class="accent-[#008f55] h-4 w-4"
        />
      </label>
    </div>

    <div class="mb-5">
      <label class="block text-xs font-bold text-gray-500 mb-2 mr-1">انتخاب بودجه</label>
      <select
        v-model="store.formData.budgetType"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#008f55] outline-none cursor-pointer"
      >
        <option value="custom">بازه دلخواه</option>
        <option value="project">پروژه بزرگ (بیش از ۵۰ میلیون)</option>
      </select>
    </div>

    <div
      v-if="store.formData.budgetType === 'custom'"
      class="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      <div>
        <label class="block text-xs font-bold text-gray-500 mb-2 mr-1">حداقل بودجه (تومان)</label>
        <input
          v-model="store.formData.minBudget"
          type="number"
          placeholder="حداقل قیمت"
          class="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#008f55]"
        />
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-500 mb-2 mr-1">حداکثر بودجه (تومان)</label>
        <input
          v-model="store.formData.maxBudget"
          type="number"
          placeholder="حداکثر قیمت"
          class="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#008f55]"
        />
      </div>
    </div>
  </div>
</template>
