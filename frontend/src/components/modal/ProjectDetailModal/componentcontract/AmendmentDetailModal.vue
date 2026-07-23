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
    <div
      v-if="store.isDetailModalOpen"
      @click.self="store.isDetailModalOpen = false"
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 dir-rtl cursor-pointer"
    >
      <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl cursor-default">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-lg">بررسی جزئیات الحاقیه</h3>
          <button @click="store.isDetailModalOpen = false"><X class="h-5 w-5" /></button>
        </div>

        <div class="space-y-4 text-sm bg-slate-50 p-4 rounded-2xl mb-6">
          <!-- 🌟 نمایش طول کریدور در صورت وجود مقدار معتبر -->
          <p
            v-if="
              amendment?.proposed_length !== null &&
              amendment?.proposed_length !== undefined &&
              amendment?.proposed_length !== '' &&
              Number(amendment.proposed_length) > 0
            "
          >
            طول محور (کریدور) جدید:
            <strong>{{ Number(amendment.proposed_length).toLocaleString('fa-IR') }} واحد</strong>
          </p>

          <!-- 🌟 نمایش مساحت در صورت وجود مقدار معتبر -->
          <p
            v-else-if="
              amendment?.proposed_area !== null &&
              amendment?.proposed_area !== undefined &&
              amendment?.proposed_area !== '' &&
              Number(amendment.proposed_area) > 0
            "
          >
            مساحت جدید:
            <strong>{{ Number(amendment.proposed_area).toLocaleString('fa-IR') }} متر مربع</strong>
          </p>

          <!-- 🌟 حالت پشتیبان (Fallback) اگر به هر دلیلی مقدار مساحت یا طول در دیتابیس ثبت نشده باشد ولی تغییر کرده باشد -->
          <p v-else class="text-amber-600 text-xs font-medium">
            ⚠️ مقادیر مساحت یا طول در این الحاقیه ارسال نشده است.
          </p>

          <p v-if="amendment?.proposed_amount !== null && amendment?.proposed_amount !== undefined">
            مبلغ جدید: <strong>{{ formatPrice(amendment?.proposed_amount) }} تومان</strong>
          </p>

          <p v-if="amendment?.proposed_delivery_time">
            مهلت زمان تحویل جدید:
            <strong
              >{{ Number(amendment.proposed_delivery_time).toLocaleString('fa-IR') }} روز</strong
            >
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
