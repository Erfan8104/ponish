<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useProfileModalStore } from '@/stores/profile.modal.store'
import { ChevronDown, LayoutDashboard, LogOut, Settings } from 'lucide-vue-next'
import ProfileImage from '@/components/modal/ProfileImage.vue'

const authStore = useAuthStore()
const profileModalStore = useProfileModalStore()
const router = useRouter()

// وضعیت منوی کشویی هدر
const isModalOpen = ref(false)

const isLoggedIn = computed(() => !!authStore.token)

// 🌟 ایجاد یک شیء فرم واکنش‌گرا برای همگام‌سازی کامل با استور شما
// استور مستقیماً پراپرتی avatar این آبجکت را مدیریت و پاک می‌کند
const userForm = reactive({
  avatar: authStore.avatar || '',
})

// گوش به زنگ بودن برای تغییرات آواتار در استور اصلی جهت هماهنگی فرم
watch(
  () => authStore.avatar,
  (newAvatar) => {
    userForm.avatar = newAvatar || ''
  },
)

// چک کردن وجود آواتار تصویری از روی فرم و استور
const hasAvatar = computed(() => !!userForm.avatar)
const avatarUrl = computed(() => userForm.avatar)

const avatarLabel = computed(() => {
  if (!isLoggedIn.value) return ''
  const source = authStore.name || authStore.phone
  return source?.trim().charAt(0).toUpperCase() || '؟'
})

// 🌟 متد باز کردن مودال نمایش/حذف عکس با ارسال فرم به استور
const handleOpenProfileModal = () => {
  profileModalStore.openModal(userForm)
}

const logout = () => {
  authStore.logout()
  isModalOpen.value = false
  router.push('/')
}
</script>

<template>
  <div v-if="isLoggedIn" class="inline-flex items-center">
    <button
      @click="isModalOpen = true"
      type="button"
      class="group flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 p-1.5 pl-3 text-sm font-medium text-slate-200 shadow-xs transition-all duration-200 hover:border-slate-700 hover:bg-slate-800 cursor-pointer focus:outline-none select-none"
    >
      <div
        class="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden bg-linear-to-br from-indigo-500 to-cyan-500 font-bold text-white shadow-xs text-xs border border-slate-800"
      >
        <img v-if="hasAvatar" :src="avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
        <span v-else>{{ avatarLabel }}</span>
      </div>

      <ChevronDown
        :size="14"
        class="text-slate-400 transition-transform duration-250 group-hover:text-slate-200"
        :class="{ 'rotate-180': isModalOpen }"
      />
    </button>

    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-100 flex items-center justify-center p-4">
        <Transition
          appear
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isModalOpen"
            @click="isModalOpen = false"
            class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
          ></div>
        </Transition>

        <Transition
          appear
          enter-active-class="transition duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div
            v-if="isModalOpen"
            class="relative w-full max-w-xs transform overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/95 p-5 text-right shadow-2xl backdrop-blur-xl transition-all"
          >
            <button
              @click="isModalOpen = false"
              class="absolute top-4 left-4 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              ✕
            </button>

            <div class="flex items-center gap-3 border-b border-slate-800/60 pb-4 mb-3">
              <div
                class="flex h-11 w-11 items-center justify-center rounded-full overflow-hidden bg-slate-950 border border-slate-800 text-sm font-bold text-slate-200 shadow-inner"
              >
                <img
                  v-if="hasAvatar"
                  :src="avatarUrl"
                  alt="Avatar"
                  class="w-full h-full object-cover cursor-zoom-in"
                  @click.stop="handleOpenProfileModal"
                />
                <span v-else>{{ avatarLabel }}</span>
              </div>
              <div class="flex flex-col text-right">
                <span class="text-sm font-semibold text-slate-100">
                  {{ authStore.name || 'کاربر عزیز' }}
                </span>
                <span class="text-[11px] text-slate-400 font-medium tracking-wide mt-0.5" dir="ltr">
                  {{ authStore.phone || authStore.email }}
                </span>
              </div>
            </div>

            <div class="space-y-1">
              <RouterLink
                to="/dashboard"
                @click="isModalOpen = false"
                class="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm text-slate-300 transition-colors duration-200 hover:bg-slate-800 hover:text-white"
              >
                <div class="flex items-center gap-2">
                  <LayoutDashboard :size="16" class="text-slate-400" />
                  <span>میز کار (داشبورد)</span>
                </div>
              </RouterLink>

              <RouterLink
                to="/profile"
                @click="isModalOpen = false"
                class="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm text-slate-300 transition-colors duration-200 hover:bg-slate-800 hover:text-white"
              >
                <div class="flex items-center gap-2">
                  <Settings :size="16" class="text-slate-400" />
                  <span>ویرایش مشخصات</span>
                </div>
              </RouterLink>

              <button
                @click="logout"
                type="button"
                class="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm text-rose-400 font-medium transition-colors duration-200 hover:bg-rose-500/10 cursor-pointer mt-1"
              >
                <div class="flex items-center gap-2">
                  <LogOut :size="16" class="text-rose-400/80" />
                  <span>خروج از حساب</span>
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <ProfileImage />
    </Teleport>
  </div>
</template>
