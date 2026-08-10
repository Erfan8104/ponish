<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { globalSearchApi } from '@/services/admin.service'

const router = useRouter()

const query = ref('')
const open = ref(false)
const loading = ref(false)
const results = ref<{
  users: any[] | null
  projects: any[] | null
  contracts: any[] | null
  payments: any[] | null
}>({ users: null, projects: null, contracts: null, payments: null })

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const rootRef = ref<HTMLElement | null>(null)

function formatMoney(n: any) {
  if (n === null || n === undefined) return '—'
  return Number(n).toLocaleString('fa-IR') + ' تومان'
}

async function runSearch() {
  const q = query.value.trim()
  if (q.length < 2) {
    results.value = { users: null, projects: null, contracts: null, payments: null }
    return
  }

  loading.value = true
  try {
    const data = await globalSearchApi(q)
    if (data?.success) {
      results.value = data.results
    }
  } catch (error) {
    console.error('خطا در جستجوی سراسری:', error)
  } finally {
    loading.value = false
  }
}

function onInput() {
  open.value = true
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(runSearch, 350)
}

function clear() {
  query.value = ''
  results.value = { users: null, projects: null, contracts: null, payments: null }
  open.value = false
}

function goTo(path: string) {
  open.value = false
  router.push(path)
}

const hasAnyCategory = () =>
  results.value.users !== null ||
  results.value.projects !== null ||
  results.value.contracts !== null ||
  results.value.payments !== null

const hasAnyResult = () =>
  (results.value.users?.length ?? 0) > 0 ||
  (results.value.projects?.length ?? 0) > 0 ||
  (results.value.contracts?.length ?? 0) > 0 ||
  (results.value.payments?.length ?? 0) > 0

function handleClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<template>
  <div ref="rootRef" class="relative w-full max-w-md" style="direction: rtl">
    <div class="relative">
      <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
      </div>

      <input
        v-model="query"
        type="text"
        placeholder="جستجوی کاربر، پروژه، قرارداد، پرداخت..."
        class="w-full h-10 pr-10 pl-9 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-gray-300"
        @input="onInput"
        @focus="open = true"
      />

      <button
        v-if="query"
        type="button"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
        @click="clear"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Dropdown نتایج -->
    <div
      v-if="open && query.trim().length >= 2"
      class="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 max-h-[70vh] overflow-y-auto z-50"
    >
      <div v-if="loading" class="flex flex-col items-center gap-2 text-gray-400 py-10">
        <div
          class="w-5 h-5 border-2 border-gray-200 border-t-[#008f55] rounded-full animate-spin"
        />
        <span class="text-xs">در حال جستجو...</span>
      </div>

      <template v-else-if="hasAnyCategory()">
        <p v-if="!hasAnyResult()" class="text-xs text-gray-400 text-center py-10">
          نتیجه‌ای یافت نشد
        </p>

        <template v-else>
          <!-- کاربران -->
          <div v-if="results.users && results.users.length" class="p-2">
            <p class="text-[11px] font-medium text-gray-400 px-2 py-1">👤 کاربران</p>
            <button
              v-for="u in results.users"
              :key="'u-' + u.id"
              class="w-full text-right px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between"
              @click="goTo(`/admin/users/${u.id}`)"
            >
              <span class="text-sm text-gray-700">{{ u.name || u.phone }}</span>
              <span class="text-[11px] text-gray-400">{{ u.phone }}</span>
            </button>
          </div>

          <!-- پروژه‌ها -->
          <div
            v-if="results.projects && results.projects.length"
            class="p-2 border-t border-gray-50"
          >
            <p class="text-[11px] font-medium text-gray-400 px-2 py-1">📁 پروژه‌ها</p>
            <button
              v-for="p in results.projects"
              :key="'p-' + p.id"
              class="w-full text-right px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between"
              @click="goTo(`/admin/projects/${p.id}`)"
            >
              <span class="text-sm text-gray-700 truncate">{{ p.title || 'بدون عنوان' }}</span>
              <span class="text-[11px] text-gray-400">{{
                p.employer?.name || p.employer?.phone
              }}</span>
            </button>
          </div>

          <!-- قراردادها -->
          <div
            v-if="results.contracts && results.contracts.length"
            class="p-2 border-t border-gray-50"
          >
            <p class="text-[11px] font-medium text-gray-400 px-2 py-1">📄 قراردادها</p>
            <button
              v-for="c in results.contracts"
              :key="'c-' + c.id"
              class="w-full text-right px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between"
              @click="goTo(`/admin/contracts/${c.id}`)"
            >
              <span class="text-sm text-gray-700 truncate">
                {{ c.project?.title || `قرارداد #${c.id}` }}
              </span>
              <span class="text-[11px] text-gray-400">{{ formatMoney(c.totalAmount) }}</span>
            </button>
          </div>

          <!-- پرداخت‌ها -->
          <div
            v-if="results.payments && results.payments.length"
            class="p-2 border-t border-gray-50"
          >
            <p class="text-[11px] font-medium text-gray-400 px-2 py-1">💳 پرداخت‌ها</p>
            <button
              v-for="pay in results.payments"
              :key="'pay-' + pay.id"
              class="w-full text-right px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between"
              @click="goTo(`/admin/contracts/${pay.contractId}`)"
            >
              <span class="text-sm text-gray-700">
                {{ pay.trackingCode || `پرداخت #${pay.id}` }}
              </span>
              <span class="text-[11px] text-gray-400">{{ formatMoney(pay.amount) }}</span>
            </button>
          </div>
        </template>
      </template>

      <p v-else class="text-xs text-gray-400 text-center py-10">
        شما به هیچ‌کدام از بخش‌های قابل جستجو دسترسی ندارید
      </p>
    </div>
  </div>
</template>
