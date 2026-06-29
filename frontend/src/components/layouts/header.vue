<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '../../stores/auth.store.ts'
import { useUiStore } from '../../stores/ui.store.ts'
import { Search, Laptop, MessageCircle, Briefcase, Menu, X } from 'lucide-vue-next'
import ProfileModal from '../modal/ProfileModal.vue'
import { useRoleStore } from '../../stores/role.store.ts'
import SearchModal from '../modal/SearchModal.vue'

const uiStore = useUiStore()
const router = useRouter()
const authStore = useAuthStore()
const roleStore = useRoleStore()
const isMobileMenuOpen = ref(false)
const isEmployee = computed<boolean>(() => {
  return roleStore.role === 'employer'
})
const isLoggedIn = computed(() => !!authStore.token)

// تابع هدایت به صفحه ویرایش مشخصات
const goToCreateProject = () => {
  if (!isLoggedIn.value) {
    router.push('/signup')
  } else {
    router.push('/newproject')
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 shadow-xl shadow-slate-950/20"
  >
    <div class="md:flex md:gap-30 max-w-8xl mx-auto px-4 md:px-6 py-0">
      <div class="flex items-center justify-between md:gap-30 md:mr-60">
        <div class="flex items-center gap-2 md:hidden">
          <button
            type="button"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-200 shadow-sm transition duration-200 hover:border-slate-700 hover:bg-slate-800"
            aria-label="Open mobile menu"
          >
            <Menu v-if="!isMobileMenuOpen" :size="20" />
            <X v-else :size="20" />
          </button>
        </div>
        <RouterLink
          to="/"
          class="inline-flex items-center gap-3 rounded-3xl px-4 py-3 text-white shadow-lg shadow-slate-950/30 transition hover:bg-slate-900"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-indigo-600 text-2xl font-bold text-white shadow-md"
          >
            P
          </div>
          <div class="flex flex-col leading-tight">
            <span class="text-lg font-semibold">Ponisha</span>
            <span class="text-xs text-slate-400">بازار فریلنسر ایرانی</span>
          </div>
        </RouterLink>

        <div class="hidden md:flex items-center gap-5">
          <RouterLink to="/" class="hover:text-white text-sm text-slate-300 transition">
            <div class="flex items-center gap-2">
              <Briefcase :size="18" /> <span>کارفرما هستم +</span>
            </div>
          </RouterLink>
          <RouterLink
            to="/login/otp"
            class="flex items-center gap-2 hover:text-white text-sm text-slate-300 transition"
          >
            <Laptop :size="18" /><span>فریلنسر هستم +</span>
          </RouterLink>
          <RouterLink
            v-if="isLoggedIn"
            to="/dashboard"
            class="hover:text-white text-sm text-slate-300 transition"
            >داشبورد</RouterLink
          >
          <RouterLink v-else to="/login" class="hover:text-white text-sm text-slate-300 transition"
            >راهنما</RouterLink
          >
        </div>
        <button
          @click="uiStore.openSearchModal()"
          class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 text-slate-200 shadow-sm transition duration-200 hover:border-slate-700 hover:bg-slate-800"
          aria-label="Search"
        >
          <Search :size="20" class="text-slate-200" />
        </button>
      </div>

      <div class="hidden md:flex items-center justify-between mr-0 gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <div v-if="!isLoggedIn" class="flex flex-wrap items-center gap-3">
            <RouterLink
              to="/login"
              class="inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 px-4 text-sm text-slate-300 shadow-sm transition hover:border-slate-700 hover:bg-slate-800"
            >
              <span
                class="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-slate-300 shadow-inner"
                >👤</span
              >
              ورود
            </RouterLink>
            <RouterLink
              to="/signup"
              class="inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/90 px-5 py-3 text-sm text-slate-200 shadow-sm transition hover:border-slate-700 hover:bg-slate-800"
            >
              ثبت نام
            </RouterLink>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-200 shadow-sm transition hover:border-slate-700 hover:bg-slate-800"
            >
              <MessageCircle :size="20" class="text-slate-200" />

              <span class="mr-2">درخواست مشاوره</span>
            </button>
          </div>

          <div v-if="isLoggedIn" class="px-40"></div>
          <button
            v-if="isEmployee || !isLoggedIn"
            type="button"
            @click="goToCreateProject"
            class="inline-flex items-center gap-2 rounded-xl bg-[#006C47] px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            ثبت سریع پروژه
          </button>
          <div v-if="isLoggedIn" class=""></div>
          <ProfileModal v-if="isLoggedIn" />
        </div>
      </div>

      <div
        v-if="isMobileMenuOpen"
        class="md:hidden mt-4 rounded-3xl border border-slate-800 p-4 shadow-lg shadow-black/20"
      >
        <div class="flex flex-col gap-3">
          <ProfileModal v-if="isLoggedIn" class="mb-2" />

          <RouterLink
            to="/"
            class="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800"
            @click="isMobileMenuOpen = false"
          >
            <Briefcase :size="18" /> <span>کارفرما هستم +</span>
          </RouterLink>
          <RouterLink
            to="/login/otp"
            class="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800"
            @click="isMobileMenuOpen = false"
          >
            <Laptop :size="18" /> <span>فریلنسر هستم +</span>
          </RouterLink>
          <RouterLink
            v-if="isLoggedIn"
            to="/dashboard"
            class="inline-flex rounded-2xl px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800"
            @click="isMobileMenuOpen = false"
          >
            داشبورد
          </RouterLink>
          <RouterLink
            v-else
            to="/login"
            class="inline-flex rounded-2xl px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800"
            @click="isMobileMenuOpen = false"
          >
            راهنما
          </RouterLink>
        </div>

        <div class="mt-4 flex flex-col gap-3">
          <button
            type="button"
            @click="uiStore.openSearchModal()"
            class="inline-flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200 shadow-sm transition hover:border-slate-700 hover:bg-slate-800"
          >
            جستجو
          </button>

          <div v-if="!isLoggedIn" class="flex flex-col gap-3">
            <RouterLink
              to="/login"
              class="inline-flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 shadow-sm transition hover:border-slate-700 hover:bg-slate-800"
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
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-2xl border border-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-slate-700 hover:bg-slate-800"
            >
              درخواست مشاوره
            </button>
          </div>

          <button
            @click="goToCreateProject"
            v-if="isEmployee || !isLoggedIn"
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#006C47] px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            ثبت سریع پروژه
          </button>
        </div>
      </div>
    </div>
  </header>

  <SearchModal />
</template>
