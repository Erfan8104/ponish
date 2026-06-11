<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// Dynamic navigation handler for button actions
const navigateTo = (destination: 'create-project' | 'workspace'): void => {
  if (destination === 'create-project') {
    console.log('Navigating to Create Project...')
    router.push('/newproject')
  } else {
    console.log('Navigating to Workspace Dashboard...')
    // router.push('/dashboard/employer')
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col justify-between p-6 antialiased text-gray-800 select-none"
  >
    <div class="flex-1 flex items-center justify-center">
      <div
        class="bg-white border border-gray-100 rounded-xl p-8 max-w-md w-full shadow-sm text-center"
      >
        <div class="flex justify-center mb-8">
          <div class="flex items-center gap-2" style="direction: rtl">
            <div
              class="bg-[#008f55] text-white rounded-xl p-2 font-black text-xl flex items-center justify-center w-11 h-11 shadow-sm"
            >
              پ
            </div>
            <span class="text-2xl font-bold text-gray-800 tracking-tight">پونیشا</span>
          </div>
        </div>

        <h2 class="text-xl font-bold mb-4 text-gray-900" style="direction: rtl">خوش آمدی!</h2>

        <p
          class="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto mb-8"
          style="direction: rtl"
        >
          حالا می‌توانید یک پروژه جدید ثبت کنید و یا وارد اتاق کار خود شوید.
        </p>

        <div class="space-y-3">
          <button
            @click="navigateTo('create-project')"
            class="w-full bg-[#008f55] hover:bg-[#007a48] text-white font-medium py-3 rounded-lg transition-colors text-sm shadow-sm"
          >
            ثبت پروژه
          </button>

          <button
            @click="navigateTo('workspace')"
            class="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 font-medium py-3 rounded-lg transition-all text-sm shadow-sm"
          >
            ورود به اتاق کار
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<
