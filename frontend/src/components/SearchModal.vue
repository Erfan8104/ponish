<script setup lang="ts">
import { computed } from 'vue'
import { Search } from 'lucide-vue-next'
import { useUiStore } from '../stores/ui.store'

const uiStore = useUiStore()
const query = computed({
  get: () => uiStore.searchQuery,
  set: (value: string) => uiStore.setSearchQuery(value),
})

const closeModal = () => {
  uiStore.resetSearch()
  uiStore.closeSearchModal()
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="uiStore.isSearchModalOpen"
      class="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-4 pt-24 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div
        class="w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 text-white shadow-2xl shadow-black/40"
      >
        <div
          class="flex flex-col gap-4 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-4">
            <span
              class="grid h-12 w-12 place-items-center rounded-3xl bg-linear-to-br from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20"
            >
              <Search :size="24" />
            </span>
            <div>
              <p class="text-base font-semibold">جستجو در پونیشا</p>
              <p class="text-xs text-slate-400">پروژه‌ها، خدمات و فریلنسرها را سریع پیدا کنید</p>
            </div>
          </div>

          <button
            @click="closeModal"
            class="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            بستن
          </button>
        </div>

        <div class="space-y-4 px-5 py-5">
          <div class="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 shadow-inner">
            <div class="flex items-center gap-3">
              <Search :size="20" class="text-slate-500" />
              <input
                v-model="query"
                type="search"
                placeholder="نام پروژه یا سرویس موردنظر را وارد کنید"
                autofocus
                class="w-full bg-transparent text-base text-white placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          <p class="text-sm text-slate-500">
            برای نمایش پیش‌نمایش بهتر، کلید Enter را بزنید یا از نتایج پیشنهادی استفاده کنید.
          </p>

          <div class="grid gap-3 sm:grid-cols-2">
            <button
              class="rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-4 text-left transition hover:border-slate-700"
            >
              <p class="text-sm font-semibold text-white">پیشنهادات محبوب</p>
              <p class="mt-1 text-xs text-slate-500">پروژه‌ها و خدمات پرطرفدار امروز</p>
            </button>
            <button
              class="rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-4 text-left transition hover:border-slate-700"
            >
              <p class="text-sm font-semibold text-white">جستجوی سریع</p>
              <p class="mt-1 text-xs text-slate-500">فریلنسرهای فعال و خدمات مرتبط</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
