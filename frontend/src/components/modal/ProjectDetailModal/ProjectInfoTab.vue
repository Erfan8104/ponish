<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/project.store'

// ۱. ایمپورت کردن کامپوننت تولید PDF
import ProjectPdfExporter from './ProjectPdfExporter.vue'

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

const getCategoryLabel = (category: string | undefined | null) => {
  if (!category) return 'ثبت نشده'
  const labels: Record<string, string> = {
    mapping: 'نقشه‌برداری زمینی',
    drone: 'عکس‌برداری هوایی',
    drafting: 'ترسیم و کارتوگرافی',
    gis: 'خدمات GIS',
    other: 'سایر',
  }
  return labels[category] || category
}
const store = useProjectStore()

const project = computed(() => store.projectDetails)
</script>

<template>
  <div v-if="project" class="space-y-8">
    <!-- ۲. قرار دادن دکمه و کامپوننت PDF در بالاترین بخش صفحه -->
    <ProjectPdfExporter />

    <!-- اطلاعات اصلی -->
    <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div class="space-y-6 p-6">
        <div>
          <h3 class="text-xl font-bold text-slate-800">
            {{ project.title || 'بدون عنوان' }}
          </h3>
        </div>

        <div class="rounded-2xl bg-slate-50 p-5 leading-8 text-slate-600">
          {{ project.description || 'توضیحاتی برای این پروژه ثبت نشده است.' }}
        </div>
      </div>
    </section>

    <!-- اطلاعات -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- موقعیت -->
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
              <p class="font-medium text-slate-700">
                {{
                  project.province && project.city
                    ? `${project.province} - ${project.city}`
                    : 'ثبت نشده'
                }}
              </p>
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

      <!-- مشخصات فنی -->
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-center gap-3">
          <div class="rounded-xl bg-violet-100 p-3">
            <BadgeCheck class="h-5 w-5 text-violet-600" />
          </div>
          <h3 class="font-bold text-slate-800">مشخصات فنی</h3>
        </div>

        <div class="grid grid-cols-2 gap-5">
          <div class="rounded-2xl bg-slate-50 p-4">
            <Ruler class="mb-2 h-5 w-5 text-blue-500" />
            <p class="text-xs text-slate-400">
              {{ project.mappingType === 'corridor' ? 'طول مسیر' : 'مساحت' }}
            </p>
            <p class="mt-2 font-bold text-slate-700">
              {{
                project.mappingType === 'corridor'
                  ? project.corridorLength
                    ? project.corridorLength + ' کیلومتر'
                    : 'ثبت نشده'
                  : project.calculatedArea
                    ? project.calculatedArea + ' هکتار'
                    : 'ثبت نشده'
              }}
            </p>
          </div>

          <div class="rounded-2xl bg-slate-50 p-4">
            <FolderKanban class="mb-2 h-5 w-5 text-indigo-500" />
            <p class="text-xs text-slate-400">نوع پروژه</p>
            <p class="mt-2 font-bold text-slate-700">
              {{ getCategoryLabel(project.category?.name) }}
            </p>
          </div>

          <div class="rounded-2xl bg-slate-50 p-4">
            <Target class="mb-2 h-5 w-5 text-red-500" />
            <p class="text-xs text-slate-400">دقت مورد نیاز</p>
            <p class="mt-2 font-bold text-slate-700">
              {{ project.requiredAccuracy || 'ثبت نشده' }}
            </p>
          </div>

          <div class="rounded-2xl bg-slate-50 p-4">
            <Clock3 class="mb-2 h-5 w-5 text-orange-500" />
            <p class="text-xs text-slate-400">زمان تحویل</p>
            <p class="mt-2 font-bold text-slate-700">
              {{ project.deliveryTime || 'ثبت نشده' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
