<script setup lang="ts">
import { computed } from 'vue'
import { useContractStore } from '@/stores/contract.store'
import { AlertTriangle, Eye } from 'lucide-vue-next'

const contractStore = useContractStore()
const amendment = computed(() => contractStore.activeAmendment)
</script>

<template>
  <div
    v-if="amendment"
    class="flex items-center justify-between p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 dir-rtl"
  >
    <div class="flex items-center gap-3">
      <AlertTriangle class="h-6 w-6 text-amber-600" />
      <div>
        <h4 class="font-bold text-sm text-amber-950">پیشنهاد اصلاحیه جدید از طرف کارفرما</h4>
        <p class="text-xs text-amber-800 mt-1">کارفرما درخواست تغییر در مفاد قرارداد را دارد.</p>
      </div>
    </div>

    <!-- اصلاح متد کلیک برای باز کردن مودال فریلنسر -->
    <button
      @click="contractStore.isDetailModalOpen = true"
      class="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition"
    >
      <Eye class="h-4 w-4" />
      مشاهده جزئیات تغییرات
    </button>
  </div>
</template>
