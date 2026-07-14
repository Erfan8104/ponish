<script setup lang="ts">
import { computed } from 'vue'
import { useContractStore } from '@/stores/contract.store'
import { useRoleStore } from '@/stores/role.store'
import { CheckCircle, XCircle, Loader2 } from 'lucide-vue-next'

const contractStore = useContractStore()
const roleStore = useRoleStore()

const amendment = computed(() => contractStore.activeAmendment)

const formatPrice = (price: number | string) => {
  return Number(price).toLocaleString('fa-IR')
}
</script>

<template>
  <div v-if="amendment" class="dir-rtl text-right">
    <!-- وضعیت در انتظار تایید (مخصوص کارفرما) -->
    <div
      v-if="amendment.status === 'pending' && roleStore.role === 'employer'"
      class="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs"
    >
      <Loader2 class="h-4 w-4 animate-spin text-slate-500" />
      <span>پیشنهاد الحاقیه شما ثبت شده و منتظر تایید یا رد از سوی فریلنسر است.</span>
    </div>

    <!-- وضعیت رد شده (Rejected) - نمایش برای هر دو طرف -->
    <div
      v-else-if="amendment.status === 'rejected'"
      class="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900"
    >
      <XCircle class="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
      <div>
        <h5 class="font-bold text-xs text-rose-950">آخرین پیشنهاد اصلاحیه رد شد</h5>
        <p class="text-[11px] text-rose-700 mt-0.5">
          درخواست تغییر به مساحت {{ amendment.proposed_area }} متر مربع و مبلغ
          {{ formatPrice(amendment.proposed_amount) }} تومان توسط فریلنسر رد شد. قرارداد بر اساس
          مفاد قبلی معتبر است.
        </p>
      </div>
    </div>

    <!-- وضعیت پذیرفته شده (Accepted) - قرارداد قفل شده و نمایش برای هر دو طرف -->
    <div
      v-else-if="amendment.status === 'accepted'"
      class="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900"
    >
      <CheckCircle class="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
      <div>
        <h5 class="font-bold text-xs text-emerald-950">توافق نهایی و الحاقیه اعمال شد</h5>
        <p class="text-[11px] text-emerald-700 mt-0.5">
          این قرارداد با مساحت و مبلغ جدید بازنویسی و قفل شده است و دیگر قابل تغییر نیست.
        </p>
      </div>
    </div>
  </div>
</template>
