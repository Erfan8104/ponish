<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useProposalStore } from '@/stores/proposal.store'
import { useProjectStore } from '@/stores/project.store'

const proposalStore = useProposalStore()
const projectStore = useProjectStore()

const proposals = computed(() => proposalStore.proposals)
const isProjectOpen = computed(() => projectStore.projectDetails?.status === 'open')

const processingId = ref<number | null>(null)

// تعریف یک computed برای زیر نظر گرفتن آی‌دی پروژه فعلی
const currentProjectId = computed(() => projectStore.projectDetails?.id)

// هر زمان آی‌دی پروژه عوض شود، پیشنهادها مجدداً واکشی می‌شوند
watch(
  currentProjectId,
  async (newId) => {
    if (newId) {
      await proposalStore.fetchProjectProposals(newId)
    }
  },
  { immediate: true },
)

const handleAcceptProposal = async (proposalId: number) => {
  if (
    confirm(
      'آیا از قبول این پیشنهاد و شروع قرارداد اطمینان دارید؟ این عمل سایر پیشنهادها را رد خواهد کرد.',
    )
  ) {
    processingId.value = proposalId
    try {
      // ۱. تایید پیشنهاد در استور پروپوزال‌ها
      await proposalStore.acceptProposal(proposalId)

      // ⚡ ۲. حیاتی: واکشی مجدد جزئیات پروژه برای به روز شدن وضعیت قرارداد در استور پروژه
      if (currentProjectId.value) {
        await projectStore.openProjectDetails(currentProjectId.value)
      }

      alert(
        '🎉 پیشنهاد با موفقیت تایید شد و قرارداد فعال گردید. اکنون می‌توانید از تب گفتگو با متخصص در ارتباط باشید.',
      )
    } catch (error) {
      console.error('خطا در تایید پیشنهاد:', error)
      alert('متاسفانه در تایید پیشنهاد خطایی رخ داد.')
    } finally {
      processingId.value = null
    }
  }
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="proposals.length === 0"
      class="rounded-xl border border-dashed p-8 text-center text-gray-500"
    >
      هنوز هیچ پیشنهادی برای این پروژه ثبت نشده است.
    </div>

    <div
      v-for="proposal in proposals"
      :key="proposal.id"
      class="rounded-xl border bg-white p-5 shadow-sm"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <img
            :src="proposal.freelancer.avatar || '/images/default-avatar.png'"
            class="h-12 w-12 rounded-full object-cover"
            alt=""
          />

          <div>
            <h3 class="font-semibold text-gray-800">
              {{ proposal.freelancer.name }}
            </h3>

            <p class="text-sm text-gray-500">
              {{ proposal.freelancer.province }}
              <span v-if="proposal.freelancer.city"> - {{ proposal.freelancer.city }} </span>
            </p>
          </div>
        </div>

        <div class="text-left">
          <p class="text-xl font-bold text-emerald-600">
            {{ Number(proposal.amount).toLocaleString('fa-IR') }} تومان
          </p>

          <p class="text-sm text-gray-500">{{ proposal.deliveryDays }} روز</p>
        </div>
      </div>

      <div class="mt-4 border-t pt-4">
        <p class="text-sm leading-7 text-gray-700 whitespace-pre-line">
          {{ proposal.coverLetter }}
        </p>
      </div>

      <div class="mt-4 flex items-center justify-between border-t pt-4">
        <div class="flex items-center gap-3">
          <span
            :class="{
              'bg-yellow-100 text-yellow-700': proposal.status === 'pending',
              'bg-emerald-100 text-emerald-700': proposal.status === 'accepted',
              'bg-red-100 text-red-700': proposal.status === 'rejected',
            }"
            class="rounded-full px-3 py-1 text-xs font-medium"
          >
            <template v-if="proposal.status === 'pending'">در انتظار بررسی</template>
            <template v-else-if="proposal.status === 'accepted'">قبول شده</template>
            <template v-else-if="proposal.status === 'rejected'">رد شده</template>
            <template v-else>{{ proposal.status }}</template>
          </span>

          <button
            v-if="isProjectOpen && proposal.status === 'pending'"
            @click="handleAcceptProposal(proposal.id)"
            :disabled="processingId !== null"
            class="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {{ processingId === proposal.id ? 'در حال ثبت...' : 'قبول پیشنهاد' }}
          </button>
        </div>

        <span class="text-xs text-gray-400">
          {{ new Date(proposal.createdAt).toLocaleDateString('fa-IR') }}
        </span>
      </div>
    </div>
  </div>
</template>
