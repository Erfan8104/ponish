<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ClipboardList, Zap } from 'lucide-vue-next'
import { useButtonCreateProjectStore } from '../../stores/buttoncreateproject.store'
// ۱. وارد کردن استور جدید برای مودال سریع
import { useQuickProjectModalStore } from '@/stores/QuickProject.modal.store'

const modalStore = useButtonCreateProjectStore()
// ۲. مقداردهی استور جدید
const quickModalStore = useQuickProjectModalStore()
const router = useRouter()

const handleDetailed = () => {
  modalStore.closeModal()
  router.push('/newproject')
}

// ۳. اصلاح تابع ثبت سریع
const handleQuick = () => {
  modalStore.closeModal() // بستن مودالِ انتخاب روش
  quickModalStore.openModal() // باز کردن مودالِ ثبت سریع
}
</script>

<template>
  <!-- استفاده از Transition برای انیمیشن ورود و خروج -->
  <Transition name="fade">
    <div
      v-if="modalStore.isModalOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <!-- لایه تارکننده پشت مودال -->
      <div
        @click="modalStore.closeModal()"
        class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-all"
      ></div>

      <!-- کانتینر اصلی مودال با افکت Glassmorphism -->
      <div
        class="relative w-full max-w-sm bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-6 overflow-hidden"
        style="direction: rtl"
      >
        <!-- افکت نورانی بالای مودال -->
        <div
          class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"
        ></div>

        <h3 class="text-xl font-black text-gray-800 mb-2">روش ثبت پروژه</h3>
        <p class="text-sm text-gray-500 mb-8 leading-relaxed">
          برای شروع، یکی از روش‌های زیر را انتخاب کنید تا فرآیند را بر اساس نیاز شما شخصی‌سازی کنیم.
        </p>

        <div class="flex flex-col gap-4">
          <!-- دکمه ثبت دقیق -->
          <button
            @click="handleDetailed"
            class="group relative w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-between px-6 hover:bg-gray-800 transition-all active:scale-[0.98]"
          >
            <span>ثبت دقیق با جزئیات</span>
            <div
              class="bg-emerald-500 p-1.5 rounded-lg group-hover:translate-x-1 transition-transform"
            >
              <ClipboardList :size="18" />
            </div>
          </button>

          <!-- دکمه ثبت سریع -->
          <button
            @click="handleQuick"
            class="group w-full bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-bold flex items-center justify-between px-6 hover:bg-emerald-100 transition-all active:scale-[0.98]"
          >
            <span>ثبت سریع پروژه</span>
            <Zap :size="18" />
          </button>
        </div>

        <button
          @click="modalStore.closeModal()"
          class="w-full mt-6 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
        >
          شاید بعداً، انصراف
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* انیمیشن محو شدن نرم */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
