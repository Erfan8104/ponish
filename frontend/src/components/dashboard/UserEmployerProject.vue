<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useProjectStore } from '@/stores/project.store'
import { useToast } from 'vue-toastification'

const toast = useToast()

const store = useProjectStore()

const deletingId = ref<number | null>(null)

onMounted(async () => {
  if (!store.myProjects.length) {
    await store.fetchMyProjects()
  }
})

watch(
  () => store.myProjects.length,
  () => {},
  { immediate: true },
)

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fa-IR')
}

const statusText = (status: string) => {
  switch (status) {
    case 'open':
      return 'باز'
    case 'in_progress':
      return 'در حال انجام'
    case 'completed':
      return 'تکمیل شده'
    default:
      return status
  }
}

const handleDelete = async (id: number) => {
  deletingId.value = id

  try {
    await store.deleteProject(id)

    toast.success('پروژه با موفقیت حذف شد 🎉')
  } catch (err) {
    toast.error('حذف پروژه انجام نشد.')
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="space-y-6 text-right" dir="rtl">
    <!-- loading -->

    <div v-if="store.isLoading" class="flex justify-center py-20">
      <div
        class="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"
      />
    </div>

    <!-- error -->

    <div v-if="store.error" class="rounded-2xl bg-red-50 border border-red-200 text-red-600 p-5">
      {{ store.error }}
    </div>

    <!-- empty -->

    <div
      v-if="!store.isLoading && store.myProjects.length === 0"
      class="rounded-3xl border border-dashed border-gray-300 bg-white py-20 text-center"
    >
      <div class="text-7xl">📁</div>

      <h2 class="mt-5 text-2xl font-bold text-gray-700">هنوز پروژه‌ای ایجاد نکرده‌اید</h2>

      <p class="mt-2 text-gray-400">اولین پروژه خود را ثبت کنید.</p>
    </div>

    <!-- list -->
    <TransitionGroup name="projects" tag="div" class="flex flex-col gap-4">
      <div
        v-for="project in store.myProjects"
        :key="project.id"
        class="group w-full rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:border-emerald-400 hover:shadow-lg"
      >
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <!-- Project -->
          <div class="flex items-center gap-4 flex-1">
            <div
              class="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl"
            >
              🌱
            </div>

            <div>
              <h2 class="text-lg font-black text-gray-800 group-hover:text-emerald-600 transition">
                {{ project.title }}
              </h2>

              <div class="flex gap-2 mt-1 flex-wrap">
                <span class="text-sm text-gray-500">
                  {{ project.category }}
                </span>

                <span class="text-gray-300">•</span>

                <span class="text-sm text-gray-500">
                  {{ project.city }}، {{ project.province }}
                </span>
              </div>
            </div>
          </div>

          <!-- Status -->

          <div class="flex justify-center">
            <span
              class="rounded-full px-4 py-2 text-xs font-bold"
              :class="{
                'bg-green-100 text-green-700': project.status === 'open',
                'bg-blue-100 text-blue-700': project.status === 'in_progress',
                'bg-gray-100 text-gray-700': project.status === 'completed',
              }"
            >
              {{ statusText(project.status) }}
            </span>
          </div>

          <!-- Statistics -->

          <div class="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div class="text-xs text-gray-400">مساحت</div>

              <div class="font-black text-emerald-600">
                {{ project.calculatedArea || 0 }}
                هکتار
              </div>
            </div>

            <div>
              <div class="text-xs text-gray-400">بودجه</div>

              <div class="font-black text-blue-600">
                {{ project.minBudget || 0 }}
                -
                {{ project.maxBudget || 0 }}
              </div>
            </div>

            <div>
              <div class="text-xs text-gray-400">تاریخ</div>

              <div class="font-semibold">
                {{ formatDate(project.createdAt) }}
              </div>
            </div>
          </div>

          <!-- Actions -->

          <div class="flex items-center gap-3">
            <button
              class="rounded-xl border border-gray-200 px-5 py-2 text-gray-700 hover:bg-gray-100 transition"
            >
              مشاهده
            </button>

            <button
              @click="handleDelete(project.id)"
              :disabled="deletingId === project.id"
              class="rounded-xl bg-red-500 px-5 py-2 font-medium text-white hover:bg-red-600 disabled:opacity-60 transition"
            >
              <template v-if="deletingId === project.id"> درحال حذف... </template>

              <template v-else> حذف </template>
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.projects-move,
.projects-enter-active,
.projects-leave-active {
  transition: all 0.35s ease;
}

.projects-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.projects-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.projects-leave-active {
  position: absolute;
}
</style>
