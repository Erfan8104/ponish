<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const displayName = computed(() => authStore.name || authStore.phone || 'کاربر')
</script>

<template>
  <div class="bg-white rounded-2xl p-6 border border-gray-200">
    <div class="flex items-center gap-4">
      <div
        class="h-16 w-16 rounded-full bg-[#008f55] text-white grid place-items-center text-xl font-bold"
      >
        {{ displayName.charAt(0) }}
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">{{ displayName }}</h3>
            <p class="text-sm text-gray-600">{{ authStore.email || 'ایمیل ثبت نشده' }}</p>
          </div>
          <button
            @click="router.push({ name: 'profile' })"
            class="text-sm text-[#008f55] font-semibold"
          >
            ویرایش
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
