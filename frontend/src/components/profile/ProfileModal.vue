<script setup lang="ts">
import { X, Download, Trash2 } from 'lucide-vue-next'
import { useProfileModalStore } from '@/stores/profile.modal.store'
import { useToast } from 'vue-toastification'

const modalStore = useProfileModalStore()
const toast = useToast()

const downloadAvatar = () => {
  const avatarUrl = modalStore.activeFormRef?.avatar
  if (!avatarUrl) return

  const link = document.createElement('a')
  link.href = avatarUrl
  link.download = `avatar-${modalStore.activeFormRef?.name || 'user'}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toast.success('تصویر با موفقیت روی سیستم شما ذخیره شد.')
}

const removeAvatar = () => {
  // 🌟 دستکاری مستقیم فرم اصلی از طریق مرجع موجود در استور (حذف نیاز به امیت)
  if (modalStore.activeFormRef) {
    modalStore.activeFormRef.avatar = ''
  }

  modalStore.closeModal()
  toast.info('عکس پروفایل حذف شد. برای اعمال نهایی دکمه ذخیره تغییرات را بزنید.')
}
</script>

<template>
  <div
    v-if="modalStore.isOpen && modalStore.activeFormRef"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-4"
    @click="modalStore.closeModal"
  >
    <div
      class="relative max-w-2xl w-full bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 flex flex-col items-center gap-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      @click.stop
    >
      <button
        @click="modalStore.closeModal"
        class="absolute top-4 left-4 text-slate-400 hover:text-white bg-slate-950/40 p-2 rounded-full border border-slate-800 cursor-pointer transition-colors"
      >
        <X :size="16" />
      </button>

      <h3 class="text-sm font-bold text-slate-300 mt-2">تصویر نمایه</h3>

      <div
        class="w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner"
      >
        <img
          :src="modalStore.activeFormRef.avatar"
          alt="Large Avatar"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="grid grid-cols-2 gap-4 w-full max-w-md border-t border-slate-800/60 pt-5">
        <button
          @click="downloadAvatar"
          type="button"
          class="flex items-center justify-center gap-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/30 px-4 py-3.5 text-xs font-semibold text-slate-300 hover:text-indigo-400 transition-all cursor-pointer"
        >
          <Download :size="14" />
          <span>ذخیره در سیستم</span>
        </button>

        <button
          @click="removeAvatar"
          type="button"
          class="flex items-center justify-center gap-2 rounded-xl bg-rose-950/40 border border-rose-900/40 hover:bg-rose-900/60 px-4 py-3.5 text-xs font-semibold text-rose-300 transition-all cursor-pointer"
        >
          <Trash2 :size="14" />
          <span>حذف عکس</span>
        </button>
      </div>
    </div>
  </div>
</template>
