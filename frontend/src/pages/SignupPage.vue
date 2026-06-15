<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendOtp } from '../services/auth.service'
import { registerSchema } from '../schemas/signup.schemas'
import { RouterLink } from 'vue-router'
const phone = ref('')
const error = ref('')
const router = useRouter()
const isLoading = ref(false)
const submit = async () => {
  const result = registerSchema.safeParse(phone.value)

  if (!result.success) {
    error.value = result.error.issues[0]?.message || 'خطایی رخ داده است '
    return
  }

  try {
    isLoading.value = true
    const response = await sendOtp(phone.value)
    console.log('Server Response : ', response)

    if (response && response.success === true) {
      router.push({
        path: '/login/otp',
        query: {
          phone: phone.value,
        },
      })
    } else {
      error.value = response?.data?.message || 'خطا در ارسال کد تایید'
    }
  } catch (err: any) {
    // ۴. مدیریت خطاهای شبکه یا خطاهای HTTP (مثل ۴۰۰ یا ۵۰۰)
    console.error('API Error:', err)

    // نمایش پیام خطای سرور به کاربر (بسته به اینکه axios استفاده می‌کنی یا fetch)
    error.value = err.response?.data?.message || 'خطایی در اتصال به سرور رخ داده است'
  } finally {
    isLoading.value = false // غیرفعال کردن لودینگ در هر حالت
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
      <h2 class="text-right font-bold text-gray-900 mb-2">ثبت نام</h2>

      <p class="text-sm text-gray-500 text-right mb-4">لطفا شماره موبایل خود را وارد کنید</p>

      <!-- Input -->
      <input
        v-model="phone"
        type="text"
        placeholder="مثال: 09123456789  "
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
        در پونیشا ثبت‌نام کرده‌اید؟
        <RouterLink to="/login" class="text-green-700 font-medium"> ورود </RouterLink>
      </div>
    </div>
  </div>
</template>
