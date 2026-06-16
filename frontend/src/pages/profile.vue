<script setup name="ProfilePage" lang="ts">
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from 'vue-toastification'
import { User, Phone, Mail, Save, RotateCcw, ArrowLeft } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  name: authStore.name || '',
  phone: authStore.phone || '',
  email: authStore.email || '',
})

const isFormValid = computed(() => {
  return form.name.trim().length > 0 && form.phone.trim().length > 0
})

const avatarLabel = computed(() => {
  const source = form.name || form.phone || '؟'
  return source.trim().charAt(0).toUpperCase()
})

const saveProfile = () => {
  if (!isFormValid.value) {
    toast.error('لطفاً نام و شماره تماس را وارد کنید')
    return
  }

  authStore.updateProfile({
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
  })

  toast.success('اطلاعات پروفایل با موفقیت ذخیره شد')
}

const resetForm = () => {
  form.name = authStore.name || ''
  form.phone = authStore.phone || ''
  form.email = authStore.email || ''
  toast.info('فرم به حالت اولیه بازگشت')
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 py-12 px-4" dir="rtl">
    <div class="max-w-2xl mx-auto">
      <div
        class="flex flex-col items-center justify-between gap-5 mb-10 relative sm:flex-row sm:items-end border-b border-slate-900 pb-6"
      >
        <div class="flex flex-col items-center text-center sm:items-start sm:text-right flex-1">
          <div class="relative group mb-4">
            <div
              class="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 via-purple-500 to-cyan-500 text-3xl font-bold text-white shadow-xl shadow-indigo-500/20 group-hover:scale-102 transition-transform duration-300"
            >
              {{ avatarLabel }}
            </div>
            <div
              class="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-xs shadow-md"
            >
              ✨
            </div>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-white">تنظیمات حساب کاربری</h1>
          <p class="text-xs text-slate-400 mt-1.5">
            اطلاعات هویتی و راه‌های ارتباطی خود را به‌روزرسانی کنید
          </p>
        </div>

        <button
          @click="router.push('/dashboard')"
          type="button"
          class="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-98 transition-all duration-200 cursor-pointer w-full sm:w-auto justify-center group"
        >
          <span>بازگشت به پنل کاربری</span>
          <ArrowLeft
            :size="14"
            class="text-indigo-200 transition-transform group-hover:-translate-x-0.5"
          />
        </button>
      </div>

      <div
        class="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 md:p-8 shadow-2xl backdrop-blur-xl"
      >
        <div class="space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-400 block mr-1"
              >نام و نام خانوادگی</label
            >
            <div class="relative flex items-center">
              <User :size="18" class="absolute right-4 text-slate-500" />
              <input
                v-model="form.name"
                type="text"
                placeholder="نام خود را وارد کنید"
                class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-400 block mr-1">شماره تلفن همراه</label>
            <div class="relative flex items-center">
              <Phone :size="18" class="absolute right-4 text-slate-500" />
              <input
                v-model="form.phone"
                type="tel"
                placeholder="مثال: 09123456789"
                class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner tabular-nums"
                dir="ltr"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-400 block mr-1">آدرس ایمیل</label>
            <div class="relative flex items-center">
              <Mail :size="18" class="absolute right-4 text-slate-500" />
              <input
                v-model="form.email"
                type="email"
                placeholder="user@example.com"
                class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
                dir="ltr"
              />
            </div>
          </div>

          <div class="border-t border-slate-800/60 my-2"></div>

          <div class="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              @click="resetForm"
              type="button"
              class="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 cursor-pointer"
            >
              <RotateCcw :size="14" />
              <span>انصراف و بازنشانی</span>
            </button>

            <button
              @click="saveProfile"
              type="button"
              :disabled="!isFormValid"
              class="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save :size="14" />
              <span>ذخیره تغییرات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
