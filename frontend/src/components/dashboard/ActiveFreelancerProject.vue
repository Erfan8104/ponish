<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useProjectStore } from '@/stores/project.store'
import ProjectDetailModal from '@/components/modal/ProjectDetailModal.vue'

const store = useProjectStore()

const currentTab = ref<'all' | 'active' | 'completed'>('all')

onMounted(() => {
  store.fetchAcceptedProjects(currentTab.value)
})

watch(currentTab, (status) => {
  store.fetchAcceptedProjects(status)
})

const openProject = async (projectId: number) => {
  await store.openProjectDetails(projectId)
}

const formatPrice = (price?: number | string | null) => {
  if (!price) return '-'

  return Number(price).toLocaleString('fa-IR')
}

const formatDate = (date?: string | null) => {
  if (!date) return '-'

  return new Date(date).toLocaleDateString('fa-IR')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Tabs -->
    <div class="flex gap-3 border-b border-slate-200 pb-4">
      <button
        @click="currentTab = 'all'"
        :class="[
          'rounded-xl px-5 py-2 text-sm font-medium transition',
          currentTab === 'all'
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        ]"
      >
        همه
      </button>

      <button
        @click="currentTab = 'active'"
        :class="[
          'rounded-xl px-5 py-2 text-sm font-medium transition',
          currentTab === 'active'
            ? 'bg-green-600 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        ]"
      >
        در حال انجام
      </button>

      <button
        @click="currentTab = 'completed'"
        :class="[
          'rounded-xl px-5 py-2 text-sm font-medium transition',
          currentTab === 'completed'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        ]"
      >
        تکمیل شده
      </button>
    </div>

    <!-- Loading -->

    <div v-if="store.isLoading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="h-32 animate-pulse rounded-2xl bg-slate-200" />
    </div>

    <!-- Empty State -->

    <div
      v-else-if="store.acceptedProjects.length === 0"
      class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"
    >
      <h3 class="text-lg font-bold text-slate-700">پروژه‌ای پیدا نشد</h3>

      <p class="mt-2 text-sm text-slate-500">هنوز پروژه‌ای در این بخش وجود ندارد.</p>
    </div>

    <!-- List -->

    <div v-else class="space-y-4">
      <div
        v-for="project in store.acceptedProjects"
        :key="project.id"
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
      >
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <!-- اطلاعات پروژه -->

          <div class="flex-1">
            <h2 class="text-xl font-bold text-slate-800">
              {{ project.title }}
            </h2>

            <p class="mt-3 line-clamp-2 text-sm leading-7 text-slate-600">
              {{ project.description }}
            </p>

            <div class="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-600">
              <span>
                <strong>کارفرما:</strong>
                {{ (project as any).employer?.name || '-' }}
                <span class="px-2"></span>

                <strong>مبلغ قرارداد:</strong>

                {{ formatPrice(project.totalAmount) }}

                تومان
              </span>

              <span>
                <strong>شهر:</strong>

                {{ project.city || '-' }}
              </span>

              <span>
                <strong>تاریخ شروع:</strong>

                {{ formatDate(project.startedAt) }}
              </span>
            </div>
          </div>

          <!-- وضعیت و عملیات -->

          <div class="flex w-full flex-col gap-3 lg:w-64">
            <div
              class="rounded-xl py-2 text-center text-sm font-semibold"
              :class="
                project.contractStatus === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              "
            >
              {{ project.contractStatus === 'active' ? 'در حال انجام' : 'تکمیل شده' }}
            </div>

            <button
              @click="openProject(project.id)"
              class="rounded-xl bg-indigo-600 py-3 text-white transition hover:bg-indigo-700"
            >
              مشاهده چزئیات و گفتگو
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->

    <ProjectDetailModal />
  </div>
</template>
