<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { verifyOtp } from '../services/auth.service'
import { useAuthStore } from '../stores/auth.store'

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()

const code = ref('')

const submit = async () => {
  const phone = route.query.phone as string

  const data = await verifyOtp(phone, code.value)

  authStore.setToken(data.token, phone)

  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
      <h1 class="text-3xl font-bold text-center mb-2">تایید شماره موبایل</h1>

      <p class="text-gray-500 text-center mb-8">کد ارسال شده را وارد کنید</p>

      <input
        v-model="code"
        type="text"
        maxlength="6"
        placeholder="123456"
        class="w-full border rounded-xl p-3 text-center text-xl tracking-widest mb-4"
      />

      <button @click="submit" class="w-full bg-black text-white py-3 rounded-xl hover:opacity-90">
        تایید
      </button>
    </div>
  </div>
</template>
