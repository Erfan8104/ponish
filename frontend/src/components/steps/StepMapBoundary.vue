<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()
const isDropdownOpen = ref(false)

const services = [
  'طراحی اپلیکیشن موبایل',
  'طراحی وب سایت',
  'اسکریپت نویسی، اتوماسیون و تست نویسی',
  'طراحی و توسعه بازی',
  'برنامه نویسی و توسعه نرم افزار',
  'توسعه شبکه، سرور و امنیت وب',
  'طراحی فروشگاه آنلاین',
  'طراحی قالب وردپرس',
  'طراحی رابط کاربری UI/UX',
  'تصویرسازی',
]

const filteredServices = computed(() => {
  const query = store.formData.category.trim().toLowerCase()
  if (!query) return services
  return services.filter((s) => s.toLowerCase().includes(query))
})

const selectService = (service: string) => {
  store.formData.category = service
  isDropdownOpen.value = false
}
</script>

<template>
  <div class="relative text-right" style="direction: rtl">
    <div class="relative">
      <input
        v-model="store.formData.category"
        type="text"
        placeholder="انتخاب یا جستجوی سرویس..."
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pr-10 text-sm focus:border-[#008f55] outline-none transition-all text-right"
        @focus="isDropdownOpen = true"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-gray-400 absolute right-3 top-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    <div
      v-if="isDropdownOpen && filteredServices.length > 0"
      class="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto"
    >
      <div
        v-for="service in filteredServices"
        :key="service"
        @click="selectService(service)"
        class="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
      >
        {{ service }}
      </div>
    </div>
  </div>
</template>
