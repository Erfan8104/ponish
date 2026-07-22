<script setup lang="ts">
import { computed } from 'vue'
import { X, XCircle } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/project.store'
import { useRoleStore } from '@/stores/role.store'
import { useToast } from 'vue-toastification'

const store = useProjectStore()
const roleStore = useRoleStore()
const toast = useToast()

// 🌟 تغییر از متغیر ثابت به computed برای واکنش‌گرایی نسبت به تغییر پروژه
const project = computed(() => store.projectDetails)

// بررسی اینکه آیا کاربر فعلی، کارفرمای همین پروژه است؟
const isEmployer = computed(() => roleStore.role === 'employer')

const handleRejectAgreement = async () => {
  const currentProject = project.value
  if (!currentProject?.id || !currentProject?.contract?.id) return

  const confirmReject = confirm(
    'آیا مطمئن هستید؟ این کار قرارداد را لغو و پروژه را به لیست عمومی برمی‌گرداند.',
  )

  if (confirmReject) {
    try {
      await store.rejectProposal(currentProject.contract.id, currentProject.id)
      toast.success('قرارداد با موفقیت لغو و پروژه باز شد')
    } catch (err) {
      toast.error('خطا در انجام عملیات')
    }
  }
}
</script>
<template>
  <header class="flex items-start justify-between border-b border-gray-200 p-6">
    <div class="flex-1">
      <h2 class="text-xl font-bold text-gray-900">
        {{ project?.title }}
      </h2>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
          {{ project?.status }}
        </span>

        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
          {{ project?.category?.name }}
        </span>

        <!-- دکمه رد توافق: فقط اگر وضعیت در حال انجام باشد و کاربر هم کارفرما باشد -->
        <button
          v-if="project?.status === 'in_progress' && project?.contract && isEmployer"
          @click="handleRejectAgreement"
          :disabled="store.isLoading"
          class="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs text-red-600 transition hover:bg-red-100 disabled:opacity-50"
        >
          <XCircle class="h-3 w-3" />
          {{ store.isLoading ? 'در حال لغو...' : 'رد توافق' }}
        </button>
      </div>
    </div>

    <button
      class="ml-4 rounded-xl p-2 transition hover:bg-gray-100"
      @click="store.closeProjectDetails"
    >
      <X class="h-5 w-5" />
    </button>
  </header>
</template>
