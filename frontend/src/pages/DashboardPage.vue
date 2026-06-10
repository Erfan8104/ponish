<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getMe } from '../services/auth.service'
import { useAuthStore } from '../stores/auth.store'

interface User {
  id: number
  phone: string
  isVerified: boolean
  profileCompleted: boolean
  createdAt: string
  updatedAt: string
}

const authStore = useAuthStore()

const user = ref<User | null>(null)

onMounted(async () => {
  user.value = await getMe(authStore.token)
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <h1 class="text-xl font-bold">Ponisha Clone</h1>

        <div
          class="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold"
        >
          {{ user?.phone?.slice(-2) }}
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-10">
      <div class="mb-8">
        <h2 class="text-3xl font-bold">سلام 👋</h2>

        <p class="text-slate-500 mt-2">به پنل کاربری خود خوش آمدید</p>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl p-6 shadow-sm border">
          <p class="text-slate-500 text-sm mb-2">شماره موبایل</p>

          <p class="font-semibold text-lg">
            {{ user?.phone }}
          </p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border">
          <p class="text-slate-500 text-sm mb-2">وضعیت حساب</p>

          <span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
            تایید شده
          </span>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border">
          <p class="text-slate-500 text-sm mb-2">تکمیل پروفایل</p>

          <span
            :class="
              user?.profileCompleted
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            "
            class="px-3 py-1 rounded-full text-sm"
          >
            {{ user?.profileCompleted ? 'تکمیل شده' : 'نیاز به تکمیل' }}
          </span>
        </div>
      </div>

      <section class="mt-10">
        <div class="bg-white rounded-2xl p-8 border shadow-sm">
          <h3 class="text-xl font-bold mb-3">شروع کار</h3>

          <p class="text-slate-500 mb-6">
            برای استفاده از امکانات سامانه، ابتدا پروفایل خود را تکمیل کنید.
          </p>

          <button class="px-5 py-3 rounded-xl bg-slate-900 text-white">تکمیل پروفایل</button>
        </div>
      </section>
    </main>
  </div>
</template>
