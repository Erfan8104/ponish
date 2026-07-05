<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/project.store'

const store = useProjectStore()

const project = store.projectDetails
</script>

<template>
  <header class="flex items-start justify-between border-b border-gray-200 p-6">
    <div>
      <h2 class="text-xl font-bold text-gray-900">
        {{ project?.title }}
      </h2>

      <p class="mt-2 text-sm text-gray-500">
        {{ project?.description }}
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
          {{ project?.status }}
        </span>

        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
          {{ project?.category?.name }}
        </span>
      </div>
    </div>

    <button class="rounded-xl p-2 transition hover:bg-gray-100" @click="store.closeProjectDetails">
      <X class="h-5 w-5" />
    </button>
  </header>
</template>
