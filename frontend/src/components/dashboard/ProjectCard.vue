<script setup lang="ts">
import { useProposalStore } from '@/stores/proposal.store'
import { useProjectStore } from '@/stores/project.store'

import { Wallet, FolderKanban, ArrowLeft, Calendar, MapPin, Briefcase } from 'lucide-vue-next'

const proposalStore = useProposalStore()
const projectStore = useProjectStore()

const openProposal = (projectId: number) => {
  const project = projectStore.projects.find((p) => p.id === projectId)

  if (!project) return

  proposalStore.openModal(project)
}

/**
 * تابع کمکی برای نمایش مقیاس مناسب (هکتار برای مساحت یا کیلومتر برای کریدور)
 */
const renderMeasurement = (project: any) => {
  if (project.mappingType === 'corridor') {
    return {
      label: 'طول مسیر',
      value: `${project.corridorLength || 0} کیلومتر`,
    }
  }
  return {
    label: 'مساحت',
    value: `${project.calculatedArea || 0} هکتار`,
  }
}

/**
 * 🌟 تابع فرمت کردن بودجه و بررسی حالت توافقی
 */
const formatBudget = (min: any, max: any) => {
  const minNum = Number(min) || 0
  const maxNum = Number(max) || 0

  if (minNum === 0 && maxNum === 0) {
    return 'قیمت توافقی'
  }

  if (minNum > 0 && maxNum > 0) {
    return `${minNum.toLocaleString()} - ${maxNum.toLocaleString()} تومان`
  } else if (minNum > 0) {
    return `از ${minNum.toLocaleString()} تومان`
  } else if (maxNum > 0) {
    return `تا ${maxNum.toLocaleString()} تومان`
  }

  return 'توافقی'
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-3xl font-black text-slate-900">پروژه‌های فعال</h2>

        <p class="mt-2 text-slate-500">پروژه مناسب خود را انتخاب کرده و پیشنهاد ارسال کنید.</p>
      </div>

      <div class="rounded-full bg-indigo-100 text-indigo-700 px-5 py-2 font-bold">
        {{ projectStore.projects.length }}
        پروژه
      </div>
    </div>

    <div v-if="projectStore.projects.length" class="space-y-6">
      <article
        v-for="project in projectStore.projects"
        :key="project.id"
        class="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:border-indigo-300 hover:shadow-2xl"
      >
        <div class="flex flex-col lg:flex-row">
          <!-- رنگ کناری -->
          <div
            class="hidden lg:block w-2 bg-gradient-to-b from-indigo-600 via-blue-500 to-cyan-400"
          />

          <!-- اطلاعات -->
          <div class="flex-1 p-7">
            <div class="flex items-start justify-between">
              <div>
                <div
                  class="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-indigo-700 text-sm font-bold"
                >
                  <FolderKanban :size="18" />

                  پروژه
                </div>

                <h3
                  class="mt-4 text-2xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition"
                >
                  {{ project.title }}
                </h3>
              </div>

              <div class="hidden md:flex rounded-2xl bg-slate-100 p-4">
                <Wallet class="text-indigo-600" :size="26" />
              </div>
            </div>

            <div class="mt-6 text-slate-600 leading-8 line-clamp-2">
              {{ project.description }}
            </div>

            <div class="mt-8 flex flex-wrap gap-3">
              <div class="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3">
                <Wallet class="text-green-600" :size="18" />

                <span class="font-semibold">
                  {{ formatBudget(project.minBudget, project.maxBudget) }}
                </span>
              </div>

              <!-- نمایش پویا متناسب با نوع نقشه‌برداری -->
              <div class="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3">
                <MapPin class="text-emerald-600" :size="18" />
                <span class="font-semibold text-slate-700">
                  {{ renderMeasurement(project).label }}: {{ renderMeasurement(project).value }}
                </span>
              </div>

              <div class="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3">
                <Calendar class="text-orange-500" :size="18" />

                زمان توافقی
              </div>

              <div class="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3">
                <Briefcase class="text-sky-500" :size="18" />

                فریلنسری
              </div>
            </div>
          </div>

          <!-- دکمه و باکس بودجه سمت چپ -->
          <div
            class="border-t lg:border-t-0 lg:border-r border-slate-200 flex flex-col justify-center items-center gap-5 p-8 bg-slate-50 lg:w-72"
          >
            <div class="text-center">
              <div class="text-sm text-slate-500">بودجه</div>

              <div class="mt-2 text-xl font-black text-slate-900">
                {{ formatBudget(project.minBudget, project.maxBudget) }}
              </div>
            </div>

            <div class="w-full space-y-3">
              <button
                @click="projectStore.openProjectDetails(project.id)"
                class="w-full rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition-all duration-300 hover:bg-slate-100 hover:border-slate-400"
              >
                مشاهده جزئیات
              </button>

              <button
                @click="openProposal(project.id)"
                class="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 py-3 font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95"
              >
                ثبت پیشنهاد
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="rounded-3xl border border-dashed border-slate-300 py-24 text-center">
      <FolderKanban class="mx-auto text-slate-300 mb-4" :size="60" />

      <h3 class="text-2xl font-bold text-slate-700">پروژه‌ای پیدا نشد</h3>

      <p class="mt-3 text-slate-500">هنوز پروژه‌ای برای نمایش وجود ندارد.</p>
    </div>
  </div>
</template>
