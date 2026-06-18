import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

export const useProfileModalStore = defineStore('profileModal', () => {
  const authStore = useAuthStore()

  // وضعیت باز یا بسته بودن مودال
  const isOpen = ref(false)

  // 🌟 نگهداری مرجعِ فرمِ صفحه اصلی برای حذف خودکار بدون نیاز به Emit
  const activeFormRef = ref<any>(null)

  // نام کاربر را مستقیماً از استور اصلی می‌خوانیم (Source of Truth)
  const userName = computed(() => authStore.name || 'کاربر')

  // 🌟 عکس بزرگ مودال را از فرمِ فعال می‌خوانیم (چون ممکن است کاربر عکس جدیدی آپلود کرده باشد که هنوز روی سرور ذخیره نشده است)
  const avatarUrl = computed(() => activeFormRef.value?.avatar || '')

  // 🌟 متد باز کردن مودال که شیء فرم کامپوننت را به عنوان ورودی دریافت می‌کند
  const openModal = (formObject: any) => {
    activeFormRef.value = formObject
    isOpen.value = true
  }

  // متد بستن مودال
  const closeModal = () => {
    isOpen.value = false
    activeFormRef.value = null
  }

  // 🌟 متد حذف آواتار بدون نیاز به Emit
  const removeAvatar = () => {
    // ۱. پاک کردن عکس از روی فرمِ صفحه اصلی به صورت مستقیم
    if (activeFormRef.value) {
      activeFormRef.value.avatar = ''
    }

    // ۲. پاک کردن عکس از استور اصلی کاربر
    authStore.avatar = ''
    // یا اگر متد خاصی دارید: authStore.$patch({ avatar: '' })

    // ۳. بستن مودال
    closeModal()
  }

  return {
    isOpen,
    avatarUrl,
    userName,
    activeFormRef,
    openModal,
    closeModal,
    removeAvatar,
  }
})
