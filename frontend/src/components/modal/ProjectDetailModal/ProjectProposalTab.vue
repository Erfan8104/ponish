<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useProposalStore } from '@/stores/proposal.store'
import { useProjectStore } from '@/stores/project.store'

const proposalStore = useProposalStore()
const projectStore = useProjectStore()
const proposals = computed(() => proposalStore.proposals)
onMounted(async () => {
  if (projectStore.projectDetails?.id) {
    await proposalStore.fetchProjectProposals(projectStore.projectDetails.id)
  }
})
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
            {{ proposal.amount }}
          </p>

          <p class="text-sm text-gray-500">{{ proposal.deliveryDays }} روز</p>
        </div>
      </div>

      <div class="mt-4 border-t pt-4">
        <p class="text-sm leading-7 text-gray-700">
          {{ proposal.coverLetter }}
        </p>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <span class="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
          {{ proposal.status }}
        </span>

        <span class="text-xs text-gray-400">
          {{ new Date(proposal.createdAt).toLocaleDateString('fa-IR') }}
        </span>
      </div>
    </div>
  </div>
</template>
