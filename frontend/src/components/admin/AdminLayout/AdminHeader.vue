<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin.store'
import { useRoleStore } from '@/stores/role.store'
import NotificationBell from '@/components/admin/ui/NotificationBell.vue'

const router = useRouter()
const adminStore = useAdminStore()
const roleStore = useRoleStore()

const searchQuery = ref('')
const showMenu = ref(false)

const handleLogout = () => {
  adminStore.logout()
  roleStore.clearUser()
  router.replace('/admin/login')
}
</script>

<template>
  <header
    class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6"
    style="direction: rtl"
  >
    <div class="flex-1 max-w-md">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="جستجو..."
        class="w-full h-10 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 transition-all"
      />
    </div>

    <div class="flex items-center gap-4">
      <NotificationBell />
      <div class="relative">
        <button type="button" class="flex items-center gap-2" @click="showMenu = !showMenu">
          <div
            class="w-9 h-9 rounded-full bg-[#008f55] text-white flex items-center justify-center text-sm font-bold"
          >
            {{ adminStore.name?.[0] || 'A' }}
          </div>
        </button>

        <div
          v-if="showMenu"
          class="absolute left-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1 text-sm z-10"
        >
          <div class="px-4 py-2 text-gray-500 border-b border-gray-100 truncate">
            {{ adminStore.name }}
          </div>
          <button
            type="button"
            class="w-full text-right px-4 py-2 text-red-500 hover:bg-red-50 transition-colors"
            @click="handleLogout"
          >
            خروج
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
