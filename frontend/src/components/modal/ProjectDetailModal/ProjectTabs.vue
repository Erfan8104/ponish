<script setup lang="ts">
// اضافه شدن 'chat' به نوع‌های مجاز
const activeTab = defineModel<'info' | 'proposals' | 'map' | 'chat'>({
  required: true,
})

const tabs = [
  { key: 'info', label: 'اطلاعات' },
  { key: 'proposals', label: 'پیشنهادها' },
  { key: 'map', label: 'نقشه' },
  { key: 'chat', label: 'گفتگو' }, // تب جدید
]
</script>

<template>
  <div class="border-b border-gray-200">
    <nav class="flex">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key as any"
        class="border-b-2 px-6 py-4 text-sm font-medium transition"
        :class="
          activeTab === tab.key
            ? 'border-emerald-500 text-emerald-600'
            : 'border-transparent text-gray-500 hover:text-gray-800'
        "
      >
        {{ tab.label }}
      </button>
    </nav>
  </div>
</template>
