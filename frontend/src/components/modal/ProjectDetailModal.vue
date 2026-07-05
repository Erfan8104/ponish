<script setup lang="ts">
import { ref } from 'vue'
import { useProjectStore } from '@/stores/project.store'

import ProjectHeader from './ProjectDetailModal/ProjectHeader.vue'
import ProjectTabs from './ProjectDetailModal/ProjectTabs.vue'

import ProjectInfoTab from './ProjectDetailModal/ProjectInfoTab.vue'
import ProjectProposalTab from './ProjectDetailModal/ProjectProposalTab.vue'
import ProjectMapTab from './ProjectDetailModal/ProjectMapTab.vue'
import ProjectFooter from './ProjectDetailModal/ProjectFooter.vue'

const store = useProjectStore()

const activeTab = ref<'info' | 'proposals' | 'map'>('info')
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="store.isProjectDetailsModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <div
          class="flex h-[90vh] w-[95vw] max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <ProjectHeader />

          <ProjectTabs v-model="activeTab" />

          <div class="flex-1 overflow-y-auto p-6">
            <ProjectInfoTab v-if="activeTab === 'info'" />

            <ProjectProposalTab v-else-if="activeTab === 'proposals'" />

            <ProjectMapTab v-model="activeTab" v-else />
          </div>

          <ProjectFooter />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
