<script setup lang="ts">
import { computed } from 'vue'
import { useContractStore } from '@/stores/contract.store'
import { Loader2, X } from 'lucide-vue-next'

const store = useContractStore()
const amendment = computed(() => store.activeAmendment)

const formatPrice = (p: any) => Number(p).toLocaleString('fa-IR')

const handleResponse = async (status: 'accepted' | 'rejected') => {
  if (!amendment.value?.id) return
  await store.handleAmendmentResponse(amendment.value.id, status)
}
</script>

<template>
  <Teleport to="body">
    <!-- استفاده از isDetailModalOpen که در استور تعریف کردیم -->
    <div
      v-if="store.isDetailModalOpen"
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 dir-rtl"
    >
      <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-lg">بررسی جزئیات الحاقیه</h3>
          <!-- اصلاح متد بستن مودال -->
          <button @click="store.isDetailModalOpen = false"><X class="h-5 w-5" /></button>
        </div>

        <div class="space-y-4 text-sm bg-slate-50 p-4 rounded-2xl mb-6">
          <p>
            مساحت جدید: <strong>{{ amendment?.proposed_area }} متر مربع</strong>
          </p>
          <p>
            مبلغ جدید: <strong>{{ formatPrice(amendment?.proposed_amount) }} تومان</strong>
          </p>
          <p v-if="amendment?.notes" class="italic text-slate-600">
            یادداشت: {{ amendment.notes }}
          </p>
        </div>

        <div class="flex gap-3">
          <button
            @click="handleResponse('rejected')"
            :disabled="store.isProcessing"
            class="flex-1 py-3 border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition"
          >
            رد پیشنهاد
          </button>
          <button
            @click="handleResponse('accepted')"
            :disabled="store.isProcessing"
            class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-emerald-700 transition"
          >
            <Loader2 v-if="store.isProcessing" class="animate-spin h-4 w-4" />
            پذیرش و امضا
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
