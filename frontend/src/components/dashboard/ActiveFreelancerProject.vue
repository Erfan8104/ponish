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

const openProject = async (contractId: number) => {
  // توجه: اینجا ممکن است در آینده نیاز باشد در استور
  // تابع openProjectDetails را طوری تغییر دهید که با contractId کار کند
  await projectStore.openProjectDetails(contractId)
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <LoaderCircle class="h-10 w-10 animate-spin text-blue-600" />
    </div>

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

    <div v-else class="space-y-4">
      <div
        v-for="project in acceptedProjects"
        :key="project.contractId"
        class="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-blue-200 hover:shadow-lg"
      >
        <div class="flex flex-col gap-6 p-6 lg:flex-row lg:items-center">
          <!-- Icon -->
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100"
          >
            <FolderKanban class="h-8 w-8 text-blue-600" />
          </div>

          <!-- Main -->
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <h2
                class="truncate text-lg font-bold text-slate-800 transition group-hover:text-blue-600"
              >
                {{ project.title }}
              </h2>

              <span
                class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
              >
                فعال
              </span>
            </div>

            <p class="mt-3 line-clamp-2 text-sm leading-7 text-slate-500">
              {{ project.description }}
            </p>

            <div class="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-600">
              <div class="flex items-center gap-2">
                <MapPin class="h-4 w-4 text-slate-400" />
                <span>{{ project.province || '---' }} - {{ project.city || '---' }}</span>
              </div>

              <div class="flex items-center gap-2">
                <CalendarDays class="h-4 w-4 text-slate-400" />
                <span>{{ project.deliveryTime || 'ثبت نشده' }}</span>
              </div>

              <div class="flex items-center gap-2">
                <BadgeDollarSign class="h-4 w-4 text-slate-400" />
                <span>{{ formatPrice(project.maxBudget || project.minBudget) }}</span>
              </div>
            </div>
          </div>

          <!-- Right -->
          <div class="flex shrink-0 flex-col items-end justify-between gap-5 lg:min-w-[170px]">
            <div class="text-sm text-slate-500">
              وضعیت
              <div class="mt-1 font-bold text-emerald-600">در حال انجام</div>
            </div>

            <button
              @click="openProject(project.contractId)"
              class="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Eye class="h-4 w-4" />
              مشاهده جزئیات و گفتگو
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
