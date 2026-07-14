<script setup lang="ts">
import { computed } from 'vue'
import { useContractStore } from '@/stores/contract.store'
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-vue-next'

const contractStore = useContractStore()

// خواندن مستقیم الحاقیه فعال از استور
const amendment = computed(() => contractStore.activeAmendment)

const formatPrice = (price: number | string) => {
  return Number(price).toLocaleString('fa-IR')
}

const handleResponse = async (status: 'accepted' | 'rejected') => {
  if (!amendment.value?.id) return
  try {
    await contractStore.handleAmendmentResponse(amendment.value.id, status)
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div
    v-if="amendment"
    class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm dir-rtl text-right"
  >
    <div class="flex items-start gap-3">
      <AlertTriangle class="h-6 w-6 text-amber-600 mt-0.5 shrink-0" />
      <div>
        <h4 class="font-bold text-sm text-amber-950">پیشنهاد اصلاحیه جدید از طرف کارفرما</h4>
        <p class="text-xs text-amber-800 mt-1 leading-relaxed">
          کارفرما درخواست تغییر مساحت به
          <span class="font-bold">{{ amendment.proposed_area }}</span> متر مربع و مبلغ کل به
          <span class="font-bold">{{ formatPrice(amendment.proposed_amount) }}</span> تومان را دارد.
        </p>
        <p
          v-if="amendment.notes"
          class="text-xs text-amber-700 mt-2 bg-amber-100/60 p-2 rounded-lg italic"
        >
          یادداشت کارفرما: {{ amendment.notes }}
        </p>
      </div>
    </div>

    <!-- دکمه‌های پاسخ فریلنسر -->
    <div class="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
      <button
        @click="handleResponse('rejected')"
        :disabled="contractStore.isProcessing"
        class="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
      >
        <XCircle class="h-4 w-4" />
        رد پیشنهاد
      </button>
      <button
        @click="handleResponse('accepted')"
        :disabled="contractStore.isProcessing"
        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
      >
        <Loader2 v-if="contractStore.isProcessing" class="h-4 w-4 animate-spin" />
        <CheckCircle v-else class="h-4 w-4" />
        پذیرش و امضا
      </button>
    </div>
  </div>
</template>
