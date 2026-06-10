<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()

const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

const email = computed(() => {
  return (route.query.email as string) || ''
})

const submit = async () => {
  error.value = ''

  if (!email.value) {
    error.value = 'ایمیل کاربر یافت نشد'
    return
  }

  if (!password.value.trim()) {
    error.value = 'لطفاً رمز عبور خود را وارد کنید'
    return
  }

  try {
    loading.value = true

    // در مراحل بعدی:
    // const response = await loginWithPassword(
    //   email.value,
    //   password.value
    // )

    console.log({
      email: email.value,
      password: password.value,
    })

    // router.push('/dashboard')
  } catch (err) {
    error.value = 'ایمیل یا رمز عبور اشتباه است'
  } finally {
    loading.value = false
  }
}

const changeEmail = () => {
  router.push('/login')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div dir="rtl" class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
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
        <h3 class="text-2xl font-bold text-right text-slate-900 mb-8">رمز عبور</h3>

        <!-- Email Info -->
        <div class="text-right mb-8">
          <p class="text-gray-700 mb-2">شما درخواست ورود به حساب زیر را دارید:</p>

          <p class="font-medium text-slate-900 break-all">
            {{ email }}
          </p>

          <button @click="changeEmail" class="mt-3 text-green-700 hover:text-green-800">
            تغییر ایمیل
          </button>
        </div>

        <!-- Password -->
        <div class="mb-2">
          <label class="block text-sm text-gray-700 text-right mb-2">
            رمز عبور خود را وارد کنید
          </label>

          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="رمز عبور"
              class="w-full h-12 border border-gray-300 rounded-md px-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />

            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              <EyeIcon v-if="!showPassword" class="w-5 h-5" />

              <EyeSlashIcon v-else class="w-5 h-5" />
            </button>
          </div>

          <p v-if="error" class="mt-2 text-sm text-red-600 text-right">
            {{ error }}
          </p>
        </div>

        <!-- Forgot Password -->
        <div class="text-right mb-8">
          <button class="text-green-700 hover:text-green-800 text-sm">فراموشی رمز عبور</button>
        </div>

        <!-- Login Button -->
        <button
          @click="submit"
          :disabled="loading"
          class="w-full h-12 rounded-md bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium transition"
        >
          {{ loading ? 'در حال ورود...' : 'ورود' }}
        </button>
      </div>

      <!-- Back -->
      <div class="mt-8 text-center">
        <button @click="goBack" class="text-gray-600 hover:text-gray-800">← بازگشت</button>
      </div>
    </div>
  </div>
</template>
