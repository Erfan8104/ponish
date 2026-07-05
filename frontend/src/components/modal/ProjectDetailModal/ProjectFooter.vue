<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/project.store'
import { X, Trash2, Edit3 } from 'lucide-vue-next'
import { useRoleStore } from '@/stores/role.store'

const store = useProjectStore()
const role = useRoleStore()

const project = computed(() => store.projectDetails)

// اجازه ویرایش از API computed (canEdit)
const canEdit = computed(() => project.value?.canEdit)
const isEmployee = computed(() => role.role === 'employer')
const canDelete = computed(() => project.value?.canEdit)
</script>

<template>
  <footer class="flex items-center justify-between border-t border-gray-200 bg-white p-4">
    <!-- Left side: status info -->
    <div class="text-xs text-gray-500">
      <span v-if="project">
        وضعیت پروژه:
        <span class="font-medium text-gray-700">
          {{ project.status }}
        </span>
      </span>
    </div>

    <!-- Right side: actions -->
    <div class="flex items-center gap-2">
      <!-- Edit -->
      <button
        v-if="canEdit && isEmployee"
        class="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100"
      >
        <Edit3 class="h-4 w-4" />
        ویرایش
      </button>

      <!-- Delete -->
      <button
        v-if="canDelete && isEmployee"
        class="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
        @click="store.deleteProject(project?.id as number)"
      >
        <Trash2 class="h-4 w-4" />
        حذف
      </button>

      <!-- Close -->
      <button
        class="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
        @click="store.closeProjectDetails"
      >
        <X class="h-4 w-4" />
        بستن
      </button>
    </div>
  </footer>
</template>
