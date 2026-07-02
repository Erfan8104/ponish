<script setup lang="ts">
import { useProposalStore } from '@/stores/proposal.store'
import { useProjectStore } from '@/stores/project.store'
import { Wallet, FolderKanban, ArrowLeft } from 'lucide-vue-next'

const proposalStore = useProposalStore()
const projectStore = useProjectStore()

const openProposal = (projectId: number) => {
  const project = projectStore.projects.find((p) => p.id === projectId)

  if (!project) return

  proposalStore.openModal(project)
}
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 lg:px-8 bg-slate-100 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-3xl font-extrabold text-slate-900">پروژه‌های فعال</h2>

        <p class="text-slate-500 mt-2">برای پروژه مناسب خود پیشنهاد ارسال کنید.</p>
      </div>

      <div
        class="hidden md:flex items-center gap-2 rounded-full bg-indigo-50 px-5 py-2 text-indigo-700 font-semibold"
      >
        {{ projectStore.projects.length }}
        پروژه
      </div>
    </div>

    <div v-if="projectStore.projects.length" class="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="project in projectStore.projects"
        :key="project.id"
        class="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-indigo-300 hover:shadow-2xl"
      >
        <div
          class="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-indigo-100 blur-3xl opacity-50"
        />

        <div class="relative">
          <div class="mb-6 inline-flex rounded-2xl bg-indigo-100 p-3 text-indigo-600">
            <FolderKanban :size="22" />
          </div>

          <h3 class="line-clamp-2 text-xl font-bold text-slate-900 leading-8">
            {{ project.title }}
          </h3>

          <div class="mt-6 rounded-2xl bg-slate-50 p-4">
            <div class="flex items-center gap-2 text-slate-500">
              <Wallet :size="18" />

              <span class="text-sm"> بودجه پروژه </span>
            </div>

            <div class="mt-2 text-lg font-bold text-slate-900">
              {{ project.minBudget?.toLocaleString() }}

              تا

              {{ project.maxBudget?.toLocaleString() }}

              تومان
            </div>
          </div>

          <button
            @click="openProposal(project.id)"
            class="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 py-4 text-white font-bold shadow-lg shadow-indigo-300 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-95"
          >
            ثبت پیشنهاد

            <ArrowLeft :size="18" />
          </button>
        </div>
      </article>
    </div>

    <div
      v-else
      class="rounded-3xl border border-dashed border-slate-300 bg-white py-24 text-center"
    >
      <FolderKanban class="mx-auto mb-5 text-slate-300" :size="60" />

      <h3 class="text-xl font-bold text-slate-700">پروژه‌ای پیدا نشد</h3>

      <p class="mt-2 text-slate-500">در حال حاضر پروژه‌ای برای نمایش وجود ندارد.</p>
    </div>
  </section>
</template>
