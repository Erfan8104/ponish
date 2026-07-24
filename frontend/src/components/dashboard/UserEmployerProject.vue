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

const formatBudget = (min: any, max: any) => {
  const minNum = Number(min) || 0
  const maxNum = Number(max) || 0

  // اگر هر دو صفر باشند یا هیچ‌کدام مقدار معتبری نداشته باشند
  if (minNum === 0 && maxNum === 0) {
    return 'توافقی'
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

const renderMeasurement = (project: any) => {
  if (project.mappingType === 'corridor') {
    return {
      label: 'طول مسیر',
      value: `${project.corridorLength || 0} کیلومتر`,
    }
  }
  // پیش‌فرض برای حالت مساحتی یا نامشخص
  return {
    label: 'مساحت',
    value: `${project.calculatedArea || 0} هکتار`,
  }
}
// اضافه کردن وضعیت جدید الحاقیه/قرارداد نهایی به لیست متون
const statusText = (status: string) => {
  switch (status) {
    case 'open':
      return 'باز'
    case 'in_progress':
      return 'در حال انجام'
    case 'accepted': // وضعیت توافق نهایی و اصلاح شده
      return 'نهایی و اصلاح شده'
    case 'completed':
      return 'تکمیل شده'
    default:
      return status
  }
}

// تابع مدیریت رنگ‌های کارت به صورت داینامیک
// تابع مدیریت رنگ‌های کارت به صورت داینامیک
const projectStyle = (status: string) => {
  const styles = {
    open: {
      card: 'border-gray-200 hover:border-emerald-400 bg-white',
      badge: 'bg-green-100 text-green-700',
      iconBg: 'bg-emerald-100 text-emerald-700',
      titleHover: 'group-hover:text-emerald-600',
    },
    in_progress: {
      card: 'border-blue-100 hover:border-blue-400 bg-blue-50/20',
      badge: 'bg-blue-100 text-blue-700',
      iconBg: 'bg-blue-100 text-blue-700',
      titleHover: 'group-hover:text-blue-600',
    },
    accepted: {
      card: 'border-emerald-300 bg-emerald-50/30 hover:shadow-emerald-100/50 shadow-sm',
      badge: 'bg-emerald-600 text-white shadow-sm',
      iconBg: 'bg-emerald-600 text-white animate-pulse',
      titleHover: 'text-emerald-700 group-hover:text-emerald-800',
    },
    completed: {
      card: 'border-emerald-200 bg-emerald-50/10 hover:border-emerald-300 shadow-sm transition-all',
      badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-600',
      titleHover: 'text-gray-700 group-hover:text-emerald-700',
    },
  }

  return styles[status as keyof typeof styles] || styles.open
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
        class="group w-full rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg"
        :class="projectStyle(project.status).card"
      >
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <!-- Project -->
          <div class="flex items-center gap-4 flex-1">
            <div
              class="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl transition-all"
              :class="projectStyle(project.status).iconBg"
            >
              <!-- ⚡ اموجی‌های داینامیک بر اساس وضعیت پروژه -->
              <template v-if="project.status === 'in_progress'">🔒</template>
              <template v-else-if="project.status === 'completed'">✅</template>
              <template v-else>🌱</template>
            </div>

            <div>
              <h2
                class="text-lg font-black text-gray-800 transition"
                :class="projectStyle(project.status).titleHover"
              >
                {{ project.title }}
              </h2>

              <div class="flex gap-2 mt-1 flex-wrap">
                <span class="text-sm text-gray-500">
                  {{ project.category?.name }}
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
              class="rounded-full px-4 py-2 text-xs font-bold transition-all"
              :class="projectStyle(project.status).badge"
            >
              {{ statusText(project.status) }}
            </span>
          </div>

          <!-- Statistics -->
          <div class="flex flex-wrap justify-center gap-8 text-center">
            <!-- Statistics -->

            <div>
              <div class="text-xs text-gray-400">{{ renderMeasurement(project).label }}</div>
              <div class="font-black text-emerald-600">
                {{ renderMeasurement(project).value }}
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-400">بودجه</div>
              <div class="font-black text-blue-600">
                {{ formatBudget(project.minBudget, project.maxBudget) }}
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
              @click="store.openProjectDetails(project.id)"
              class="rounded-xl border px-5 py-2 transition text-sm font-bold"
              :class="
                project.status === 'in_progress'
                  ? 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700 shadow-sm'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-100'
              "
            >
              {{ project.status === 'in_progress' ? 'مدیریت قرارداد' : 'مشاهده' }}
            </button>

            <button
              v-if="project.status !== 'in_progress' && project.status !== 'completed'"
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
