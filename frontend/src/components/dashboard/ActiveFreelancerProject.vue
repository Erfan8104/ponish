<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '@/stores/project.store'

import {
  MapPin,
  CalendarDays,
  BadgeDollarSign,
  LoaderCircle,
  CircleAlert,
  FolderKanban,
  Eye,
} from 'lucide-vue-next'

const projectStore = useProjectStore()

const { acceptedProjects, isLoading } = storeToRefs(projectStore)

onMounted(async () => {
  if (!acceptedProjects.value.length) {
    await projectStore.fetchAcceptedProjects()
  }
})

const formatPrice = (value: any) => {
  if (!value) return 'توافقی'

  return Number(value).toLocaleString('fa-IR') + ' تومان'
}

const openProject = async (projectId: number) => {
  await projectStore.openProjectDetails(projectId)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <LoaderCircle class="h-10 w-10 animate-spin text-blue-600" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="acceptedProjects.length === 0"
      class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center"
    >
      <CircleAlert class="mx-auto mb-4 h-14 w-14 text-slate-400" />

      <h3 class="text-xl font-bold text-slate-700">پروژه فعالی وجود ندارد</h3>

      <p class="mt-2 text-sm text-slate-500">
        هنوز هیچ پیشنهادی از طرف کارفرما برای شما پذیرفته نشده است.
      </p>
    </div>

    <!-- Projects -->
    <div v-else class="grid gap-6 lg:grid-cols-2">
      <div
        v-for="project in acceptedProjects"
        :key="project.id"
        class="rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <!-- Header -->
        <div class="border-b border-slate-100 p-6">
          <div class="flex items-start justify-between">
            <div class="flex gap-4">
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                <FolderKanban class="h-7 w-7 text-blue-600" />
              </div>

              <div>
                <h2 class="text-lg font-bold text-slate-800">
                  {{ project.title }}
                </h2>

                <p class="mt-2 line-clamp-2 text-sm text-slate-500">
                  {{ project.description }}
                </p>
              </div>
            </div>

            <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              فعال
            </span>
          </div>
        </div>

        <!-- Body -->
        <div class="space-y-4 p-6">
          <div class="flex items-center gap-3 text-slate-600">
            <MapPin class="h-5 w-5 text-slate-400" />

            <span>
              {{ project.province || '---' }}
              -
              {{ project.city || '---' }}
            </span>
          </div>

          <div class="flex items-center gap-3 text-slate-600">
            <CalendarDays class="h-5 w-5 text-slate-400" />

            <span>
              {{ project.deliveryTime || 'ثبت نشده' }}
            </span>
          </div>

          <div class="flex items-center gap-3 text-slate-600">
            <BadgeDollarSign class="h-5 w-5 text-slate-400" />

            <span>
              {{ formatPrice(project.maxBudget || project.minBudget) }}
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-slate-100 p-6">
          <div class="text-sm text-slate-500">
            وضعیت:
            <span class="font-bold text-emerald-600"> در حال انجام </span>
          </div>

          <button
            @click="openProject(project.id)"
            class="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Eye class="h-4 w-4" />

            مشاهده جزئیات
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
