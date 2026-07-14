<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useContractStore } from '@/stores/contract.store'
import { useRoleStore } from '@/stores/role.store'

import ContractUpdateWizard from './ContractUpdateWizard.vue'
import AmendmentFreelancerActions from './componentcontract/AmendmentFreelancerActions.vue'
import AmendmentStatusBanner from './componentcontract/AmendmentStatusBanner.vue'

import {
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Ruler,
  Target,
  MapPinned,
  Settings2,
} from 'lucide-vue-next'

const contractStore = useContractStore()
const roleStore = useRoleStore()

// ⚡ گرفتن مستقیم دیتای پروژه و قرارداد از استور (بدون وابستگی به Props والد)
const contract = computed(() => contractStore.currentContract)
const project = computed(() => contractStore.currentProject)

onMounted(() => {
  if (contract.value?.id) {
    contractStore.fetchAmendments(contract.value.id)
  }
})

const activeAmendment = computed(() => contractStore.activeAmendment)
const isContractLocked = computed(() => activeAmendment.value?.status === 'accepted')

const displayAmount = computed(() => {
  // ۱. بررسی می‌کنیم آیا الحاقیه تایید شده‌ای وجود دارد؟
  const isAccepted = activeAmendment.value?.status === 'accepted'

  // ۲. اگر الحاقیه تایید شده بود، مبلغ پیشنهادی جدید را اولویت قرار بده
  if (isAccepted && activeAmendment.value?.proposed_amount) {
    return Number(activeAmendment.value.proposed_amount).toLocaleString('fa-IR')
  }

  // ۳. در غیر این صورت، از مبالغ خود قرارداد استفاده کن
  const price = contract.value?.amount || contract.value?.finalAmount || 0
  return Number(price).toLocaleString('fa-IR')
})

const displayDate = computed(() => {
  // ۱. بررسی وضعیت تایید الحاقیه
  const isAccepted = activeAmendment.value?.status === 'accepted'

  // ۲. انتخاب تاریخ مناسب (اگر الحاقیه تایید شده بود، تاریخ الحاقیه و در غیر این صورت تاریخ قرارداد)
  const rawDate =
    (isAccepted && activeAmendment.value?.updatedAt) ||
    activeAmendment.value?.createdAt ||
    contract.value?.createdAt ||
    project.value?.createdAt

  if (!rawDate) return 'ثبت نشده'

  const dateObj = new Date(rawDate)
  if (isNaN(dateObj.getTime())) return 'فرمت تاریخ نامعتبر'

  return dateObj.toLocaleDateString('fa-IR')
})

const statusLabel = computed(() => {
  // ۱. اگر الحاقیه تایید شده بود، مستقیماً وضعیت را «نهایی و قفل شده» نشان بده
  if (activeAmendment.value?.status === 'accepted') {
    return 'نهایی و اصلاح شده'
  }

  // ۲. در غیر این صورت، بر اساس وضعیت اصلی قرارداد در بک‌اَند عمل کن
  const status = contract.value?.status || 'active'
  switch (status) {
    case 'active':
    case 'in_progress':
      return 'در حال اجرا'
    case 'completed':
      return 'پایان یافته'
    case 'terminated':
      return 'لغو شده'
    default:
      return status
  }
})
</script>

<template>
  <div v-if="!contract" class="p-8 text-center text-slate-500 text-sm">
    در حال بارگذاری اطلاعات قرارداد...
  </div>

  <div v-else class="space-y-6 dir-rtl text-right">
    <!-- نمایش هوشمند باکس‌های وضعیت الحاقیه بدون پاس دادن هیچ پراپسی -->
    <div v-if="activeAmendment" class="space-y-4">
      <AmendmentFreelancerActions
        v-if="activeAmendment.status === 'pending' && roleStore.role === 'freelancer'"
      />
      <AmendmentStatusBanner v-else />
    </div>

    <!-- هدر ابزارهای مدیریتی کارفرما -->
    <div
      class="flex items-center justify-between bg-slate-100/50 p-4 rounded-2xl border border-slate-200/40"
    >
      <div class="text-xs text-slate-500 font-medium">مدیریت مفاد و تعهدات رسمی قرارداد جاری</div>

      <button
        v-if="roleStore.role === 'employer' && !isContractLocked"
        @click="contractStore.isOpenAmendmentModal = true"
        class="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
      >
        <Settings2 class="h-4 w-4" />
        بروزرسانی یا ثبت قرارداد نهایی
      </button>

      <span
        v-else-if="isContractLocked && roleStore.role === 'employer'"
        class="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl"
      >
        🔒 این قرارداد نهایی شده و دیگر قابل تغییر نیست
      </span>
    </div>

    <!-- کارت‌های وضعیت مالی و زمانی کلی قرارداد -->
    <div class="grid gap-6 md:grid-cols-3">
      <div
        class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4"
      >
        <div class="rounded-xl bg-blue-50 p-3 text-blue-600">
          <DollarSign class="h-6 w-6" />
        </div>
        <div>
          <p class="text-xs text-slate-400 font-medium">مبلغ نهایی قرارداد</p>
          <p class="mt-1 text-lg font-bold text-slate-800">{{ displayAmount }} تومان</p>
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4"
      >
        <div class="rounded-xl bg-amber-50 p-3 text-amber-600">
          <Calendar class="h-6 w-6" />
        </div>
        <div>
          <p class="text-xs text-slate-400 font-medium">تاریخ انعقاد قرارداد</p>
          <p class="mt-1 text-sm font-semibold text-slate-700">{{ displayDate }}</p>
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4"
      >
        <div
          class="rounded-xl p-3"
          :class="
            contract.status === 'terminated'
              ? 'bg-rose-50 text-rose-600'
              : 'bg-emerald-50 text-emerald-600'
          "
        >
          <CheckCircle2 class="h-6 w-6" />
        </div>
        <div>
          <p class="text-xs text-slate-400 font-medium">وضعیت قرارداد</p>
          <span
            class="mt-1 inline-block text-xs font-bold px-2.5 py-0.5 rounded-full"
            :class="
              contract.status === 'terminated'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-emerald-100 text-emerald-700'
            "
          >
            {{ statusLabel }}
          </span>
        </div>
      </div>
    </div>

    <!-- مشخصات فنی و محدوده نقشه‌برداری توافق شده -->
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
        <MapPinned class="h-5 w-5 text-emerald-600" />
        <h3 class="font-bold text-slate-800 text-base">محدوده و تعهدات فنی نقشه‌برداری</h3>
      </div>

      <div class="grid grid-cols-2 gap-5 md:grid-cols-4">
        <div class="rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <Ruler class="mb-2 h-5 w-5 text-blue-500" />
          <p class="text-xs text-slate-400">مساحت حوزه عملیاتی</p>
          <p class="mt-2 font-bold text-slate-700 text-sm">
            {{ Number(project?.calculatedArea).toLocaleString('fa-IR') }} متر مربع
          </p>
        </div>

        <div class="rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <Target class="mb-2 h-5 w-5 text-rose-500" />
          <p class="text-xs text-slate-400">دقت خطای مجاز</p>
          <p class="mt-2 font-bold text-slate-700 text-sm">{{ project?.requiredAccuracy }}</p>
        </div>

        <div class="rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <MapPinned class="mb-2 h-5 w-5 text-emerald-500" />
          <p class="text-xs text-slate-400">سیستم مختصات مرجع</p>
          <p class="mt-2 font-bold text-slate-700 text-sm">{{ project?.coordinateSystem }}</p>
        </div>

        <div class="rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <Calendar class="mb-2 h-5 w-5 text-orange-500" />
          <p class="text-xs text-slate-400">مهلت زمانی تحویل</p>
          <p class="mt-2 font-bold text-slate-700 text-sm">{{ project?.deliveryTime }}</p>
        </div>
      </div>
    </div>

    <!-- مستندات فایلی -->
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center gap-2 border-b border-slate-50 pb-4">
        <FileText class="h-5 w-5 text-indigo-500" />
        <h3 class="font-bold text-slate-800 text-base">مستندات و فایل‌های تحویلی</h3>
      </div>
      <div
        class="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500 border border-dashed border-slate-200"
      >
        <AlertCircle class="h-8 w-8 text-slate-400 mx-auto mb-2" />
        در حال حاضر هیچ فایلی برای این قرارداد ارسال نشده است.
      </div>
    </div>

    <!-- ویزارد آپدیت بدون پاس دادن پراپس‌های اضافه -->
    <ContractUpdateWizard v-if="!isContractLocked" />
  </div>
</template>

<style scoped>
.dir-rtl {
  direction: rtl;
}
</style>
