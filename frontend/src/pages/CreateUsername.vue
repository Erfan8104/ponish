<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// States
const username = ref<string>('')
const role = ref<'freelancer' | 'employer' | null>(null)
const isValidUsername = ref<boolean>(false)

// Validation Rules logic
const validateUsername = (): void => {
  // Regex: Only English letters and numbers, no symbols or spaces
  const regex = /^[a-zA-Z0-9]+$/
  isValidUsername.value = regex.test(username.value) && username.value.length >= 3
}

// Check if form can be submitted
const isFormValid = computed<boolean>(() => {
  return isValidUsername.value && role.value !== null
})

// Submit Handler
const handleRegister = (): void => {
  if (!isFormValid.value) return

  const payload = {
    username: username.value.toLowerCase(),
    role: role.value,
  }

  console.log('Submitting Registration:', payload)

  // برای هدایت به مرحله بعد پروژه:
  // router.push('/dashboard')
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 antialiased text-gray-800 select-none"
  >
    <div class="flex-1 flex items-center justify-centermy-4">
      <div
        class="bg-white border border-gray-100 rounded-xl p-8 max-w-lg w-full shadow-sm text-center"
      >
        <div class="flex justify-center mb-6">
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
          ایجاد حساب کاربری
        </h2>

        <p
          class="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto mb-6"
          style="direction: rtl"
        >
          از اینکه به پونیشا پیوستید خوشحالیم. برای تکمیل حساب کاربری موارد زیر را وارد نمایید.
        </p>

        <form @submit.prevent="handleRegister" class="text-right">
          <label class="block text-xs font-medium text-gray-500 mb-2 mr-1" style="direction: rtl">
            نام کاربری
          </label>

          <div class="mb-4" style="direction: ltr">
            <input
              v-model="username"
              type="text"
              placeholder="Username"
              class="w-full h-11 px-4 border border-gray-200 rounded-lg focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-sm font-medium"
              @input="validateUsername"
            />
          </div>

          <ul
            class="text-[11px] text-gray-400 space-y-1.5 mb-8 mr-1 list-disc list-inside"
            style="direction: rtl"
          >
            <li
              class="list-none text-emerald-600 font-medium"
              v-if="isValidUsername && username.length > 0"
            >
              ✓ نام کاربری در دسترس است
            </li>
            <li>امکان تغییر نام کاربری وجود نخواهد داشت.</li>
            <li>نام کاربری شما باید انگلیسی و منحصر به فرد باشد.</li>
            <li>
              نام کاربری درست می‌تواند شامل اعداد، حروف و بدون سیمبل (<span class="font-sans"
                >!@#$%^&*()</span
              >) باشد.
            </li>
            <li class="list-none text-gray-500 font-medium mt-1">
              مثال نام کاربری درست: <span class="font-sans text-xs">ali012</span>
            </li>
          </ul>

          <div class="grid grid-cols-2 gap-4 mb-8" style="direction: rtl">
            <div
              @click="role = 'freelancer'"
              :class="[
                'border-2 rounded-xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all select-none',
                role === 'freelancer'
                  ? 'border-[#008f55] bg-emerald-50/20 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200 bg-white',
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                :class="[
                  'h-7 w-7 transition-colors',
                  role === 'freelancer' ? 'text-[#008f55]' : 'text-gray-700',
                ]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span
                :class="[
                  'text-xs font-bold transition-colors',
                  role === 'freelancer' ? 'text-[#008f55]' : 'text-gray-700',
                ]"
                >فریلنسر هستم</span
              >
            </div>

            <div
              @click="role = 'employer'"
              :class="[
                'border-2 rounded-xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all select-none',
                role === 'employer'
                  ? 'border-[#008f55] bg-emerald-50/20 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200 bg-white',
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                :class="[
                  'h-7 w-7 transition-colors',
                  role === 'employer' ? 'text-[#008f55]' : 'text-gray-700',
                ]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span
                :class="[
                  'text-xs font-bold transition-colors',
                  role === 'employer' ? 'text-[#008f55]' : 'text-gray-700',
                ]"
                >کارفرما هستم</span
              >
            </div>
          </div>

          <button
            type="submit"
            :disabled="!isFormValid"
            :class="[
              'w-full font-medium py-3 rounded-lg text-sm shadow-sm transition-all text-white',
              isFormValid
                ? 'bg-[#008f55] hover:bg-[#007a48] cursor-pointer'
                : 'bg-gray-200 cursor-not-allowed text-gray-400',
            ]"
          >
            ادامه
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
