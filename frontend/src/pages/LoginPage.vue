<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendOtp } from '../services/auth.service'
import { loginSchema } from '../schemas/login.schema'
import { RouterLink } from 'vue-router'
import { checkLoginMethod } from '../services/auth.service'
import geokarMark from '@/assets/logo/geokar-logo-mark.svg'

const identifier = ref('')
const error = ref('')
const router = useRouter()

const submit = async () => {
  error.value = ''

  const result = loginSchema.safeParse(identifier.value)

  if (!result.success) {
    error.value = result.error.issues[0]?.message ?? 'لطفا ایمیل یا شماره موبایل معتبر وارد کنید'

    return
  }

  const response = await checkLoginMethod(identifier.value)

  if (response.method === 'otp') {
    await sendOtp(identifier.value)

    router.push({
      path: '/login/otp',
      query: {
        phone: identifier.value,
      },
    })
  }

  if (response.method === 'password') {
    router.push({
      path: '/login/password',
      query: {
        email: identifier.value,
      },
    })
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-200 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white border border-gray-200 rounded-xl p-8 shadow-sm md:mb-50">
      <!-- Logo -->

      <div class="inline-flex items-center gap-3 rounded-3xl px-4 py-3 md:mr-20 mb-10">
        <img :src="geokarMark" alt="GeoKar" class="h-12 w-12 rounded-2xl shadow-md shrink-0" />
        <div class="flex flex-col leading-tight">
          <span class="text-lg text-slate-600 font-semibold">GeoKar</span>
          <span class="text-xs text-slate-600">بازار تخصصی نقشه‌برداری</span>
        </div>
      </div>

      <!-- Title -->
      <h2 class="text-right font-bold text-gray-900 mb-2">ورود</h2>

      <p class="text-sm text-gray-500 text-right mb-4">لطفا شماره موبایل خود را وارد کنید</p>

      <!-- Input -->
      <input
        v-model="identifier"
        type="text"
        placeholder="مثال: 09123456789 "
        class="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
      />
      <div v-if="error" class="text-red-600 text-sm mt-2">
        {{ error }}
      </div>
      <!-- Button -->
      <button
        @click="submit"
        class="w-full mt-5 h-12 bg-green-700 hover:bg-green-800 text-white rounded-md transition cursor-pointer"
      >
        ادامه
      </button>

      <!-- Register -->
      <div class="text-center mt-6 text-sm text-gray-600">
        در جئوکار ثبت‌نام نکرده‌اید؟
        <RouterLink to="/signup" class="text-green-700 font-medium hover:underline">
          ثبت نام</RouterLink
        >
      </div>

      <!-- 🌟 بخش مدرن و مینیمال ورود ادمین (بر اساس استانداردهای UX) -->
      <div class="border-t border-gray-100 mt-6 pt-4 text-center">
        <RouterLink
          to="/admin/login"
          class="text-xs text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1"
        >
          <span>ورود به پنل مدیریت سیستم</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-3.5 h-3.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
