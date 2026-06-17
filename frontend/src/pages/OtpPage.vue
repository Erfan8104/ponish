<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { verifyOtp } from '@/services/auth.service'

// States & Type Definitions
const otp = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<(HTMLInputElement | null)[]>([])
const timer = ref<number>(116) // 1:56 minutes
const showToast = ref<boolean>(true)
const isLoading = ref<boolean>(false)
const error = ref<string>('') // رفع مشکل تعریف نشدن error

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// دریافت شماره تلفن از کوری استرینگ
const phone = (route.query.phone as string) || ''

let timerInterval: ReturnType<typeof setInterval> | null = null

// نمایش شماره تلفن فرمت شده یا مقدار پیش‌فرض
const phoneNumber = computed<string>(() => {
  if (Array.isArray(route.query.phone)) return route.query.phone[0] || ''
  return (route.query.phone as string) || '۰۹۳۷۱۲۶۱۲۹۰'
})

// تابع اصلی ارسال و تایید کد OTP
const handleVerifyOtp = async () => {
  // ۱. چسباندن آرایه ۶ تایی به یکدیگر برای ساخت کد نهایی
  const otpCode = otp.value.join('')

  if (otpCode.length < 6) {
    error.value = 'لطفا کد تایید ۶ رقمی را به طور کامل وارد کنید'
    return
  }

  try {
    error.value = ''
    isLoading.value = true

    // ۲. ارسال درخواست به بک‌اندر از طریق سرویس شما
    const response = await verifyOtp(phone, otpCode)

    if (response.success) {
      // ۳. ذخیره توکن و دیتای کاربر در استور پینیا
      authStore.setToken(response.token, response.user.phone, response.user.name || '')

      if (response.user.email) {
        authStore.setEmail(response.user.email)
      }

      // ۴. هدایت هوشمند کاربر بر اساس وضعیت ثبت نام
      if (response.isNewUser) {
        router.push('/onboarding/create-username')
      } else {
        router.push('/dashboard')
      }
    } else {
      error.value = response.message || 'کد وارد شده نامعتبر است'
    }
  } catch (err: any) {
    console.error('خطا در تایید کد:', err)
    error.value = err.response?.data?.message || 'کد فعال‌سازی اشتباه یا منقضی شده است'
  } finally {
    isLoading.value = false
  }
}

// Helper to safely assign component refs in template loop
const setInputRef = (el: any, index: number): void => {
  if (el) {
    inputRefs.value[index] = el as HTMLInputElement
  }
}

// مدیریت جابجایی خودکار فوکوس بین باکس‌ها
const handleInput = (event: Event, index: number): void => {
  const target = event.target as HTMLInputElement
  const val = target.value

  if (!/^[0-9]$/.test(val) && val !== '') {
    otp.value[index] = ''
    return
  }

  if (val && index < 5) {
    const nextInput = inputRefs.value[index + 1]
    nextInput?.focus()
  }
}

const handleDelete = (index: number): void => {
  if (!otp.value[index] && index > 0) {
    otp.value[index - 1] = ''
    const prevInput = inputRefs.value[index - 1]
    prevInput?.focus()
  }
}

// مدیریت تایمر صفحه
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const startTimer = (): void => {
  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, 1000)
}

const resendCode = (): void => {
  timer.value = 116
  showToast.value = true
  startTimer()
  // در صورت نیاز می‌توانید اینجا دوباره متد ارسال پيامک اصلی را صدا بزنید (مثلا sendOtp)
}

// Lifecycle Hooks
onMounted(() => {
  startTimer()
  setTimeout(() => {
    showToast.value = false
  }, 4000)
})

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col justify-between p-6 antialiased text-gray-800 select-none"
  >
    <!-- Toast Notification -->
    <transition
      enter-active-class="transition ease-out duration-300 transform"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200 transform"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="showToast"
        class="absolute top-6 right-6 bg-white border border-emerald-100 shadow-lg rounded-lg p-4 flex items-center gap-3 z-50"
        style="direction: rtl"
      >
        <div class="bg-[#008f55] text-white rounded-full p-1 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="3"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span class="text-sm font-medium text-gray-700">کد تایید با موفقیت پیامک شد.</span>
        <button
          @click="showToast = false"
          class="text-gray-400 hover:text-gray-600 mr-auto text-xs pr-2"
        >
          ✕
        </button>
      </div>
    </transition>

    <!-- Main Card -->
    <div class="flex-1 flex items-center justify-center">
      <div
        class="bg-white border border-gray-100 rounded-xl p-8 max-w-md w-full shadow-sm text-center"
      >
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <div class="flex items-center gap-2" style="direction: rtl">
            <div
              class="bg-[#008f55] text-white rounded-xl p-2 font-black text-xl flex items-center justify-center w-11 h-11 shadow-sm"
            >
              پ
            </div>
            <span class="text-2xl font-bold text-gray-800 tracking-tight">پونیشا</span>
          </div>
        </div>

        <h2 class="text-xl font-bold mb-4 text-gray-900" style="direction: rtl">
          کد تایید را وارد کنید
        </h2>

        <p class="text-sm text-gray-500 leading-relaxed" style="direction: rtl">
          برای ساخت حساب جدید، کد پیامک شده به شمارهٔ
        </p>
        <p class="text-base font-semibold text-gray-700 my-2 tracking-wider" style="direction: ltr">
          {{ phoneNumber }}
        </p>

        <!-- لینک بازگشت به ویرایش شماره تلفن -->
        <RouterLink
          to="/register"
          class="text-xs text-cyan-600 hover:text-cyan-700 font-medium mb-8 block mx-auto transition-colors"
          style="direction: rtl"
        >
          تغییر شمارهٔ موبایل
        </RouterLink>

        <!-- OTP Input Fields -->
        <div class="flex justify-center gap-2 mb-4" style="direction: ltr">
          <input
            v-for="(digit, index) in 6"
            :key="index"
            :ref="(el) => setInputRef(el, index)"
            v-model="otp[index]"
            type="text"
            maxLength="1"
            class="w-12 h-12 text-center text-xl font-bold border border-gray-200 rounded-lg focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all tabular-nums"
            :disabled="isLoading"
            @input="handleInput($event, index)"
            @keydown.delete="handleDelete(index)"
            @keyup.enter="handleVerifyOtp"
          />
        </div>

        <!-- Error Messages UI -->
        <div v-if="error" class="text-red-600 text-sm mb-4 text-right" style="direction: rtl">
          {{ error }}
        </div>

        <!-- Timer / Resend section -->
        <div class="text-xs text-gray-400 mb-8" style="direction: rtl">
          <span v-if="timer > 0" class="tabular-nums">
            {{ formatTime(timer) }} مانده تا دریافت مجدد کد
          </span>
          <button
            v-else
            @click="resendCode"
            class="text-[#008f55] hover:text-[#007a48] font-semibold transition-colors"
          >
            ارسال مجدد کد تایید
          </button>
        </div>

        <!-- Submit Button -->
        <button
          @click="handleVerifyOtp"
          :disabled="isLoading"
          class="w-full bg-[#008f55] hover:bg-[#007a48] text-white font-medium py-3 rounded-lg transition-colors text-sm shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading">در حال بررسی کد...</span>
          <span v-else>تایید</span>
        </button>
      </div>
    </div>

    <!-- Bottom Back Action -->
    <div class="text-center">
      <RouterLink
        to="/register"
        class="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
        style="direction: rtl"
      >
        <span>بازگشت</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </RouterLink>
    </div>
  </div>
</template>
