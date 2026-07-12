<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useProjectStore } from '@/stores/project.store'

import ProjectHeader from './ProjectDetailModal/ProjectHeader.vue'
import ProjectTabs from './ProjectDetailModal/ProjectTabs.vue'

import ProjectInfoTab from './ProjectDetailModal/ProjectInfoTab.vue'
import ProjectProposalTab from './ProjectDetailModal/ProjectProposalTab.vue'
import ProjectMapTab from './ProjectDetailModal/ProjectMapTab.vue'
import ProjectChatTab from './ProjectDetailModal/ProjectChatTab.vue'
import ProjectFooter from './ProjectDetailModal/ProjectFooter.vue'

const store = useProjectStore()

const activeTab = ref<'info' | 'proposals' | 'map' | 'chat'>('info')

const hasContract = computed(() => !!store.projectDetails?.contract)

// هر بار مودال باز شد تب اطلاعات نمایش داده شود
watch(
  () => store.isProjectDetailsModalOpen,
  (isOpen) => {
    if (isOpen) {
      activeTab.value = 'info'
    }
  },
)

const closeModal = () => {
  store.isProjectDetailsModalOpen = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="store.isProjectDetailsModalOpen"
        @click="closeModal"
        class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
      >
        <div
          @click.stop
          class="relative flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-[0_30px_80px_rgba(0,0,0,.25)]"
        >
          <ProjectHeader />

          <ProjectTabs v-model="activeTab" />

          <div
            class="flex-1 overflow-y-auto bg-slate-50/60 p-6 scrollbar-thin scrollbar-thumb-slate-300"
          >
            <ProjectInfoTab v-if="activeTab === 'info'" />

            <ProjectProposalTab v-else-if="activeTab === 'proposals'" />

            <ProjectMapTab v-else-if="activeTab === 'map'" />

            <ProjectChatTab
              v-else-if="activeTab === 'chat' && hasContract"
              :contractId="store.projectDetails!.contract!.id"
            />
          </div>

          <ProjectFooter />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.28s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
