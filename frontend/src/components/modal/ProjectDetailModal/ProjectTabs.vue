<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/project.store'

const store = useProjectStore()

const showProposalTab = computed(() => {
  return store.projectDetails?.status === 'open'
})

// شرط بررسی وجود قرارداد برای نمایش چت
const showChatTab = computed(() => {
  return !!store.projectDetails?.contract
})

const activeTab = defineModel<'info' | 'proposals' | 'map' | 'chat'>({
  required: true,
})

const tabs = computed(() => [
  {
    key: 'info',
    label: 'اطلاعات',
  },

  ...(showProposalTab.value
    ? [
        {
          key: 'proposals',
          label: 'پیشنهادها',
        },
      ]
    : []),

  {
    key: 'map',
    label: 'نقشه',
  },

  // اعمال شرط نمایش چت در آرایه تب‌ها ⚡
  ...(showChatTab.value
    ? [
        {
          key: 'chat',
          label: 'گفتگو',
        },
      ]
    : []),
])
</script>

<template>
  <!-- طراحی مدرن، شیشه‌ای و مینی‌مال تب‌ها -->
  <div class="border-b border-slate-100 bg-white/60 p-2 backdrop-blur-md dir-rtl">
    <nav class="flex space-x-1 space-x-reverse rounded-xl bg-slate-100/80 p-1 max-w-max">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key as any"
        :class="[
          'relative rounded-lg px-5 py-2 text-xs font-semibold transition-all duration-300 outline-none select-none',
          activeTab === tab.key
            ? 'bg-white text-slate-900 shadow-sm shadow-slate-200/50'
            : 'text-slate-500 hover:bg-white/40 hover:text-slate-800',
        ]"
      >
        <!-- متن تب -->
        <span class="relative z-10 flex items-center gap-1.5">
          {{ tab.label }}
          <!-- یک نقطه مینی‌مال برای تب چت در صورت فعال بودن (اختیاری برای زیبایی بیشتر) -->
          <span
            v-if="tab.key === 'chat'"
            class="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"
          ></span>
        </span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
/* جهت‌نویسی راست‌چین برای زبان فارسی */
.dir-rtl {
  direction: rtl;
}
</style>
