<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin.store'

const router = useRouter()
const adminStore = useAdminStore()

const phone = ref('')
const password = ref('')

const handleAdminLogin = async () => {
  if (!phone.value || !password.value) {
    adminStore.errorMessage = 'لطفاً شماره تلفن و رمز عبور را وارد کنید.'
    return
  }

  const success = await adminStore.login(phone.value, password.value)

  if (success) {
    router.push('/admin/users')
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-800 select-none"
    style="direction: rtl"
  >
    <div
      class="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-sm text-center"
    >
      <div class="flex justify-center mb-6">
        <div
          class="bg-[#008f55] text-white rounded-2xl p-3 font-black text-xl flex items-center justify-center w-14 h-14 shadow-sm"
        >
          مدیر
        </div>
      </div>

      <h2 class="text-xl font-bold mb-2 text-gray-900">ورود به پنل مدیریت</h2>
      <p class="text-xs text-gray-400 mb-6">مختص مدیران و دسترسی‌های ارشد سیستم پونیشا</p>

      <!-- نمایش خطا از طریق استور -->
      <div
        v-if="adminStore.errorMessage"
        class="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-right"
      >
        {{ adminStore.errorMessage }}
      </div>

      <form @submit.prevent="handleAdminLogin" class="text-right space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-2 mr-1">شماره تلفن ادمین</label>
          <input
            v-model="phone"
            type="text"
            placeholder="09120000000"
            class="w-full h-11 px-4 border border-gray-200 rounded-xl focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-sm font-medium"
            style="direction: ltr; text-align: right"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-500 mb-2 mr-1">رمز عبور</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••••••"
            class="w-full h-11 px-4 border border-gray-200 rounded-xl focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-sm font-medium"
            style="direction: ltr; text-align: right"
          />
        </div>

        <button
          type="submit"
          :disabled="adminStore.loading"
          class="w-full mt-4 bg-[#008f55] hover:bg-[#007a48] text-white font-bold py-3.5 rounded-xl text-sm shadow-sm transition-all cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {{ adminStore.loading ? 'در حال بررسی...' : 'ورود به پنل مدیریت' }}
        </button>
      </form>
    </div>
  </div>
</template>
