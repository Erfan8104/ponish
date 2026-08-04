<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ProjectTriggerButton from '../common/ProjectTriggerButton.vue'
import { updateRoleApi } from '@/services/auth.service'
import { useAuthStore } from '../../stores/auth.store.ts'
import { useUiStore } from '../../stores/ui.store.ts'
import {
  Search,
  Laptop,
  MessageCircle,
  Briefcase,
  Menu,
  X,
  Plus,
  LayoutDashboard,
} from 'lucide-vue-next'
import geokarMark from '@/assets/logo/geokar-logo-mark.svg'
import ProfileModal from '../modal/ProfileModal.vue'
import { useRoleStore } from '../../stores/role.store.ts'
import SearchModal from '../modal/SearchModal.vue'
import { useRouter } from 'vue-router'

const uiStore = useUiStore()
const router = useRouter()
const authStore = useAuthStore()
const roleStore = useRoleStore()
const isMobileMenuOpen = ref(false)

const isEmployee = computed<boolean>(() => {
  return roleStore.role === 'employer'
})

const isLoggedIn = computed(() => !!authStore.token)

const switchRole = async (targetRole: 'employer' | 'freelancer' | 'both') => {
  // اگر کاربر لاگین نکرده بود، هدایت به صفحه ورود
  if (!authStore.token) {
    router.push(targetRole === 'freelancer' ? '/login' : '/login')
    return
  }

  try {
    // چون سرویس شما مستقیماً response.data را برمی‌گرداند،
    // مستقیماً نتیجه را در یک متغیر مثل result می‌گیریم
    const result = await updateRoleApi(targetRole)

    if (result && result.success) {
      // ذخیره توکن جدید در مرورگر
      localStorage.setItem('token', result.token)

      // 🌟 به‌روزرسانی نقش فقط در roleStore (چون مدیریت نقش‌ها آنجاست)
      roleStore.role = result.role

      // اگر می‌خواهید استور auth را هم رفرش کنید تا توکن جدید یا اطلاعات ست شود،
      // معمولاً یک متد مثل fetchUser یا ست کردن توکن دارید:
      authStore.token = result.token
    }
  } catch (error: any) {
    console.error('خطا در تغییر نقش:', error.response?.data || error.message)

    // اگر توکن منقضی شده بود یا خطای 401 داد
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
  }

  // بعد از هر تغییر نقش، منوی موبایل را ببند
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header
    class="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 shadow-xl shadow-slate-950/20"
  >
    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 lg:h-20 items-center justify-between gap-4">
        <!-- Logo + mobile toggle -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-200 shadow-sm transition duration-200 hover:border-slate-700 hover:bg-slate-800"
            :aria-expanded="isMobileMenuOpen"
            aria-label="باز کردن منو"
          >
            <Menu v-if="!isMobileMenuOpen" :size="20" />
            <X v-else :size="20" />
          </button>

          <RouterLink
            to="/"
            class="inline-flex items-center gap-2 sm:gap-3 rounded-3xl px-2 sm:px-4 py-2 text-white transition hover:bg-slate-900"
            @click="isMobileMenuOpen = false"
          >
            <img
              :src="geokarMark"
              alt="GeoKar"
              class="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl shadow-md shrink-0"
            />
            <div class="hidden sm:flex flex-col leading-tight">
              <span class="text-lg font-semibold">GeoKar</span>
              <span class="text-xs text-slate-400">بازار فریلنسر ایرانی</span>
            </div>
          </RouterLink>
        </div>

        <!-- Desktop nav (role switch + help/dashboard) -->
        <nav class="hidden lg:flex items-center gap-5 flex-1 justify-center">
          <button
            @click="switchRole('employer')"
            class="hover:text-white text-sm transition flex items-center gap-2 whitespace-nowrap"
            :class="
              roleStore.role === 'employer' ? 'text-cyan-400 font-semibold' : 'text-slate-300'
            "
          >
            <Briefcase :size="18" /> <span>کارفرما هستم</span>
          </button>

          <button
            @click="switchRole('freelancer')"
            class="hover:text-white text-sm transition flex items-center gap-2 whitespace-nowrap"
            :class="
              roleStore.role === 'freelancer' ? 'text-cyan-400 font-semibold' : 'text-slate-300'
            "
          >
            <Laptop :size="18" /><span>فریلنسر هستم</span>
          </button>

          <RouterLink
            v-if="isLoggedIn"
            to="/dashboard"
            class="hover:text-white text-sm text-slate-300 transition flex items-center gap-2 whitespace-nowrap"
          >
            <LayoutDashboard :size="18" />
            <span>پنل کاربری</span>
          </RouterLink>
          <RouterLink
            v-else
            to="/login"
            class="hover:text-white text-sm text-slate-300 transition whitespace-nowrap"
            >راهنما</RouterLink
          >
        </nav>

        <!-- Desktop actions -->
        <div class="hidden lg:flex items-center gap-3 shrink-0">
          <template v-if="!isLoggedIn">
            <RouterLink
              to="/login"
              class="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-300 shadow-sm transition hover:border-slate-700 hover:bg-slate-800 whitespace-nowrap"
            >
              <span
                class="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-slate-300 shadow-inner"
                >👤</span
              >
              ورود
            </RouterLink>
            <RouterLink
              to="/signup"
              class="inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/90 px-5 py-2.5 text-sm text-slate-200 shadow-sm transition hover:border-slate-700 hover:bg-slate-800 whitespace-nowrap"
            >
              ثبت نام
            </RouterLink>
            <RouterLink
              to="/consultation"
              class="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-slate-700 hover:bg-slate-800"
              @click="isMobileMenuOpen = false"
            >
              <MessageCircle :size="18" />
              درخواست مشاوره
            </RouterLink>
          </template>

          <template v-else>
            <ProjectTriggerButton v-if="isEmployee">
              <Plus :size="15" />
              <span>ثبت پروژه جدید</span>
            </ProjectTriggerButton>
            <ProfileModal />
          </template>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-show="isMobileMenuOpen" class="lg:hidden pb-4 border-t border-slate-800 pt-4">
        <div class="flex flex-col gap-2">
          <ProfileModal v-if="isLoggedIn" class="mb-2" />

          <button
            @click="switchRole('employer')"
            class="rounded-2xl px-4 py-3 text-sm text-right transition flex items-center gap-2 hover:bg-slate-900"
            :class="
              roleStore.role === 'employer' ? 'text-cyan-400 font-semibold' : 'text-slate-300'
            "
          >
            <Briefcase :size="18" /> <span>کارفرما هستم</span>
          </button>

          <button
            @click="switchRole('freelancer')"
            class="rounded-2xl px-4 py-3 text-sm text-right transition flex items-center gap-2 hover:bg-slate-900"
            :class="
              roleStore.role === 'freelancer' ? 'text-cyan-400 font-semibold' : 'text-slate-300'
            "
          >
            <Laptop :size="18" /><span>فریلنسر هستم</span>
          </button>

          <RouterLink
            v-if="isLoggedIn"
            to="/dashboard"
            class="rounded-2xl px-4 py-3 text-sm text-slate-200 transition flex items-center gap-2 hover:bg-slate-900"
            @click="isMobileMenuOpen = false"
          >
            <LayoutDashboard :size="18" />
            <span>پنل کاربری</span>
          </RouterLink>
          <RouterLink
            v-else
            to="/login"
            class="rounded-2xl px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-900"
            @click="isMobileMenuOpen = false"
          >
            راهنما
          </RouterLink>
        </div>

        <div class="mt-4 flex flex-col gap-3">
          <template v-if="!isLoggedIn">
            <RouterLink
              to="/login"
              class="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 shadow-sm transition hover:border-slate-700 hover:bg-slate-800"
              @click="isMobileMenuOpen = false"
            >
              ورود
            </RouterLink>
            <RouterLink
              to="/signup"
              class="inline-flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-200 shadow-sm transition hover:border-slate-700 hover:bg-slate-800"
              @click="isMobileMenuOpen = false"
            >
              ثبت نام
            </RouterLink>
            <RouterLink
              to="/consultation"
              class="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-slate-700 hover:bg-slate-800"
              @click="isMobileMenuOpen = false"
            >
              <MessageCircle :size="18" />
              درخواست مشاوره
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </header>

  <SearchModal />
</template>
