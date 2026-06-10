<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendOtp } from '../services/auth.service'
import { loginSchema } from '../schemas/login.schema'
import { RouterLink } from 'vue-router'
import { checkLoginMethod } from '../services/auth.service'

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

      <div class="inline-flex items-center gap-3 rounded-3xl px-4 py-3 text-white md:mr-20 mb-10">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-indigo-600 text-2xl font-bold text-white shadow-md"
        >
          P
        </div>
        <div class="flex flex-col leading-tight">
          <span class="text-lg text-slate-600 font-semibold">Ponisha</span>
          <span class="text-xs text-slate-600">بازار فریلنسر ایرانی</span>
        </div>
      </div>

      <!-- Title -->
      <h2 class="text-right font-bold text-gray-900 mb-2">ورود</h2>

      <p class="text-sm text-gray-500 text-right mb-4">
        لطفا شماره موبایل یا ایمیل خود را وارد کنید
      </p>

      <!-- Input -->
      <input
        v-model="identifier"
        type="text"
        placeholder="مثال: 09123456789 یا mail@gmail.com"
        class="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
      />
      <div v-if="error" class="text-red-600 text-sm mt-2">
        {{ error }}
      </div>
      <!-- Button -->
      <button
        @click="submit"
        class="w-full mt-5 h-12 bg-green-700 hover:bg-green-800 text-white rounded-md transition"
      >
        ادامه
      </button>

      <!-- Register -->
      <div class="text-center mt-6 text-sm text-gray-600">
        در پونیشا ثبت‌نام نکرده‌اید؟
        <RouterLink to="/signup" class="text-green-700 font-medium"> ثبت نام</RouterLink>
      </div>
    </div>
  </div>
</template>
