<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/project.store'

import {
  FolderKanban,
  MapPinned,
  MapPin,
  Ruler,
  Target,
  Clock3,
  FileText,
  BadgeCheck,
} from 'lucide-vue-next'

const store = useProjectStore()

const project = computed(() => store.projectDetails)
</script>

<template>
  <div v-if="project" class="space-y-8">
    <!-- اطلاعات اصلی -->
    <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div class="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-5">
        <div class="rounded-2xl bg-blue-100 p-3">
          <FolderKanban class="h-6 w-6 text-blue-600" />
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-800">اطلاعات پروژه</h2>

          <p class="text-sm text-slate-500">مشخصات کلی پروژه</p>
        </div>
      </div>

      <div class="space-y-6 p-6">
        <div>
          <h3 class="text-xl font-bold text-slate-800">
            {{ project.title }}
          </h3>

          <div class="mt-3">
            <span
              class="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-700"
            >
              {{ project.status }}
            </span>
          </div>
        </div>

        <div class="rounded-2xl bg-slate-50 p-5 leading-8 text-slate-600">
          {{ project.description }}
        </div>
      </div>
    </section>

    <!-- اطلاعات -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- موقعیت -->
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      >
        <div class="mb-6 flex items-center gap-3">
          <div class="rounded-xl bg-emerald-100 p-3">
            <MapPinned class="h-5 w-5 text-emerald-600" />
          </div>

          <h3 class="font-bold text-slate-800">موقعیت پروژه</h3>
        </div>

        <div class="space-y-5">
          <div class="flex items-start gap-3">
            <MapPin class="mt-1 h-5 w-5 text-slate-400" />

            <div>
              <p class="text-xs text-slate-400">استان و شهر</p>

              <p class="font-medium text-slate-700">{{ project.province }} - {{ project.city }}</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <MapPin class="mt-1 h-5 w-5 text-slate-400" />

            <div>
              <p class="text-xs text-slate-400">آدرس</p>

              <p class="font-medium text-slate-700">
                {{ project.address || 'ثبت نشده' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- مشخصات -->
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      >
        <div class="mb-6 flex items-center gap-3">
          <div class="rounded-xl bg-violet-100 p-3">
            <BadgeCheck class="h-5 w-5 text-violet-600" />
          </div>

          <h3 class="font-bold text-slate-800">مشخصات فنی</h3>
        </div>

        <div class="grid grid-cols-2 gap-5">
          <div class="rounded-2xl bg-slate-50 p-4">
            <Ruler class="mb-2 h-5 w-5 text-blue-500" />

            <p class="text-xs text-slate-400">مساحت</p>

            <p class="mt-2 font-bold text-slate-700">{{ project.calculatedArea }} متر مربع</p>
          </div>

          <div class="rounded-2xl bg-slate-50 p-4">
            <Target class="mb-2 h-5 w-5 text-red-500" />

            <p class="text-xs text-slate-400">دقت مورد نیاز</p>

            <p class="mt-2 font-bold text-slate-700">
              {{ project.requiredAccuracy }}
            </p>
          </div>

          <div class="rounded-2xl bg-slate-50 p-4">
            <MapPinned class="mb-2 h-5 w-5 text-emerald-500" />

            <p class="text-xs text-slate-400">سیستم مختصات</p>

            <p class="mt-2 font-bold text-slate-700">
              {{ project.coordinateSystem }}
            </p>
          </div>

          <div class="rounded-2xl bg-slate-50 p-4">
            <Clock3 class="mb-2 h-5 w-5 text-orange-500" />

            <p class="text-xs text-slate-400">زمان تحویل</p>

            <p class="mt-2 font-bold text-slate-700">
              {{ project.deliveryTime }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
