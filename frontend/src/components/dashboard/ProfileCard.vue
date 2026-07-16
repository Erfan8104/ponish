<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useRoleStore } from '@/stores/role.store' // 🌟 اضافه شد
import { Plus, UserRoundPen, User, Mail, Phone } from 'lucide-vue-next'
// اضافه کردن این خط به لیست ایمپورت‌ها
import ProjectTriggerButton from '@/components/common/ProjectTriggerButton.vue'

const authStore = useAuthStore()
const roleStore = useRoleStore() // 🌟 اضافه شد
const router = useRouter()

// تشخیص نقش کاربر برای متن خوش‌آمدگویی
const isEmployee = computed<boolean>(() => {
  return roleStore.role === 'employer'
})

const displayName = computed(() => authStore.name || authStore.phone || 'کاربر mapIq')
const avatarLabel = computed(() => displayName.value.trim().charAt(0).toUpperCase())

// تابع هدایت به صفحه ویرایش مشخصات
const goToProfile = () => {
  router.push({ name: 'profile' })
}
</script>

<template>
  <div class="mx-auto font-sans select-none" dir="rtl">
    <div class="bg-white border border-gray-100 shadow-xl shadow-gray-100/40 overflow-hidden">
      <div class="p-6 md:p-8 border-b border-gray-100 bg-linear-to-b from-gray-50/50 to-white">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
            <!-- 🌟 آواتار مجهز به نمایش عکس استور و قابلیت کلیک برای هدایت به پروفایل -->
            <div class="relative cursor-pointer group" @click="goToProfile" title="ویرایش مشخصات">
              <div
                class="flex h-20 w-20 items-center justify-center rounded-full overflow-hidden bg-[#008f55] text-2xl font-black text-white border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-200"
              >
                <!-- اگر عکس در استور بود آن را نشان می‌دهد، در غیر این صورت حرف اول نام -->
                <img
                  v-if="authStore.avatar"
                  :src="authStore.avatar"
                  alt="Avatar"
                  class="w-full h-full object-cover"
                />
                <span v-else>
                  {{ avatarLabel }}
                </span>
              </div>
              <div
                class="absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 border-2 border-white text-[8px] shadow-sm"
              >
                🟢
              </div>
            </div>

            <div @click="goToProfile">
              <h1 class="text-xl font-black text-gray-900">{{ displayName }}</h1>
              <!-- 🌟 داینامیک شدن متن خوش‌آمدگویی بر اساس نقش فعلی در استور -->
              <p class="text-xs font-bold text-gray-400 mt-1">
                خوش آمدید • پنل {{ isEmployee ? 'کارفرمای' : 'مجری' }} SAJ
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto justify-center">
            <button
              @click="goToProfile"
              type="button"
              class="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
            >
              <UserRoundPen :size="14" class="text-gray-500" />
              <span>ویرایش مشخصات</span>
            </button>

            <!-- دکمه ثبت پروژه فقط برای کارفرما معنی دارد، اگر کاربر فریلنسر بود می‌توانی دکمه را مخفی کنی یا تغییر دهی -->
            <!-- کد جدید -->
            <ProjectTriggerButton v-if="isEmployee">
              <Plus :size="15" />
              <span>ثبت پروژه جدید</span>
            </ProjectTriggerButton>
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
              <span class="text-xs font-black text-gray-700 truncate mt-0.5">
                {{ authStore.name || 'ثبت نشده' }}
              </span>
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
              >
                {{ authStore.phone || 'ثبت نشده' }}
              </span>
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
              <span class="text-xs font-black text-gray-700 truncate mt-0.5" dir="ltr">
                {{ authStore.email || 'ایمیل ثبت نشده' }}
              </span>
            </div>
          </div>
        </div>

        <!-- فیلدهای اختصاصی که بر اساس نقش کاربر از استور خوانده می‌شوند -->
        <div class="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- اگر کارفرما بود -->
          <template v-if="isEmployee">
            <div v-if="authStore.company" class="text-xs text-gray-600 font-medium">
              🏢 <span class="font-bold text-gray-400">شرکت:</span> {{ authStore.company }}
            </div>
            <div
              v-if="authStore.province || authStore.city"
              class="text-xs text-gray-600 font-medium"
            >
              📍 <span class="font-bold text-gray-400">موقعیت:</span> {{ authStore.province }}،
              {{ authStore.city }}
            </div>
          </template>

          <!-- اگر فریلنسر بود -->
          <template v-else>
            <div v-if="authStore.skills" class="text-xs text-gray-600 font-medium md:col-span-2">
              🛠️ <span class="font-bold text-gray-400">مهارت‌ها:</span> {{ authStore.skills }}
            </div>
            <div v-if="authStore.education" class="text-xs text-gray-600 font-medium">
              🎓 <span class="font-bold text-gray-400">تحصیلات:</span> {{ authStore.education }}
            </div>
            <div
              v-if="authStore.freelancerProvince || authStore.freelancerCity"
              class="text-xs text-gray-600 font-medium"
            >
              📍 <span class="font-bold text-gray-400">محل سکونت:</span>
              {{ authStore.freelancerProvince }}، {{ authStore.freelancerCity }}
            </div>
          </template>
        </div>

        <p
          class="text-[11px] text-gray-400 font-medium mt-6 leading-relaxed text-center sm:text-right"
        >
          این اطلاعات جهت هماهنگی پروژه‌های شما محفوظ است. در صورت نیاز به تغییر، روی عکس آواتار یا
          دکمه ویرایش کلیک کنید.
        </p>
      </div>
    </div>
  </div>
</template>
