<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { Plus, UserRoundPen, User, Mail, Phone } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const displayName = computed(() => authStore.name || authStore.phone || 'کاربر پونیشا')
const avatarLabel = computed(() => displayName.value.trim().charAt(0).toUpperCase())
</script>

<template>
  <div class="mx-auto font-sans select-none" dir="rtl">
    <div class="bg-white border border-gray-100 shadow-xl shadow-gray-100/40 overflow-hidden">
      <div class="p-6 md:p-8 border-b border-gray-100 bg-linear-to-b from-gray-50/50 to-white">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
            <div class="relative">
              <div
                class="flex h-20 w-20 items-center justify-center rounded-full bg-[#008f55] text-2xl font-black text-white border-4 border-white shadow-md"
              >
                {{ avatarLabel }}
              </div>
              <div
                class="absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 border-2 border-white text-[8px] shadow-sm"
              >
                🟢
              </div>
            </div>

            <div>
              <h1 class="text-xl font-black text-gray-900">{{ displayName }}</h1>
              <p class="text-xs font-bold text-gray-400 mt-1">خوش آمدید • پنل کارفرمای پونیشا</p>
            </div>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto justify-center">
            <button
              @click="router.push({ name: 'profile' })"
              type="button"
              class="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
            >
              <UserRoundPen :size="14" class="text-gray-500" />
              <span>ویرایش مشخصات</span>
            </button>

            <button
              @click="router.push('/newproject')"
              type="button"
              class="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-[#008f55] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#007446] transition-all cursor-pointer"
            >
              <Plus :size="15" />
              <span>ثبت پروژه جدید</span>
            </button>
          </div>
        </div>
      </div>

      <div class="p-6 md:p-8 bg-white">
        <h2 class="text-sm font-black text-gray-800 mb-5">اطلاعات حساب کاربری</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex items-center gap-3 bg-gray-50/60 border border-gray-100 rounded-2xl p-4">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500"
            >
              <User :size="16" />
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-[10px] font-bold text-gray-400">نام و نام خانوادگی</span>
              <span class="text-xs font-black text-gray-700 truncate mt-0.5">{{
                authStore.name || 'ثبت نشده'
              }}</span>
            </div>
          </div>

          <div class="flex items-center gap-3 bg-gray-50/60 border border-gray-100 rounded-2xl p-4">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500"
            >
              <Phone :size="16" />
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-[10px] font-bold text-gray-400">شماره تلفن همراه</span>
              <span
                class="text-xs font-black text-gray-700 truncate mt-0.5 tracking-wide"
                dir="ltr"
                >{{ authStore.phone || 'ثبت نشده' }}</span
              >
            </div>
          </div>

          <div class="flex items-center gap-3 bg-gray-50/60 border border-gray-100 rounded-2xl p-4">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500"
            >
              <Mail :size="16" />
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-[10px] font-bold text-gray-400">آدرس ایمیل</span>
              <span class="text-xs font-black text-gray-700 truncate mt-0.5" dir="ltr">{{
                authStore.email || 'ایمیل ثبت نشده'
              }}</span>
            </div>
          </div>
        </div>

        <p
          class="text-[11px] text-gray-400 font-medium mt-6 leading-relaxed text-center sm:text-right"
        >
          این اطلاعات جهت هماهنگی پروژه‌های نقشه‌برداری شما محفوظ است. در صورت نیاز به تغییر، روی
          دکمه ویرایش کلیک کنید.
        </p>
      </div>
    </div>
  </div>
</template>
