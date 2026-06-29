<script setup lang="ts">
import { useProjectStore } from '@/stores/project.store'
import { computed } from 'vue'

const projectStore = useProjectStore()

const recentActivities = computed(() => projectStore.activityLogs.slice(0, 8))

const getActivityIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    project_created: '✨',
    project_updated: '✏️',
    project_deleted: '🗑️',
    file_uploaded: '📁',
    status_changed: '🔄',
  }
  return iconMap[type] || '📝'
}

const getActivityColor = (type: string) => {
  const colorMap: Record<string, string> = {
    project_created: 'bg-green-50 border-green-200',
    project_updated: 'bg-blue-50 border-blue-200',
    project_deleted: 'bg-red-50 border-red-200',
    file_uploaded: 'bg-purple-50 border-purple-200',
    status_changed: 'bg-yellow-50 border-yellow-200',
  }
  return colorMap[type] || 'bg-gray-50 border-gray-200'
}

const getActivityTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    project_created: 'پروژه جدید',
    project_updated: 'پروژه بروزرسانی شد',
    project_deleted: 'پروژه حذف شد',
    file_uploaded: 'فایل بارگذاری شد',
    status_changed: 'وضعیت تغییر یافت',
  }
  return textMap[type] || type
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'همین الآن'
  if (diffMins < 60) return `${diffMins} دقیقه پیش`
  if (diffHours < 24) return `${diffHours} ساعت پیش`
  if (diffDays < 7) return `${diffDays} روز پیش`
  return date.toLocaleDateString('fa-IR')
}
</script>

<template>
  <div class="bg-white rounded-[28px] p-6 shadow-sm shadow-slate-200/60 w-full overflow-hidden">
    <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-xl font-semibold text-slate-900">فعالیت‌های اخیر</h2>
      <p class="text-sm text-slate-500">آخرین رویدادهای تیم و پروژه‌ها</p>
    </div>

    <div
      v-if="recentActivities.length === 0"
      class="rounded-[24px] border border-slate-200 bg-slate-50 p-8 text-center"
    >
      <p class="text-slate-500">هیچ فعالیتی ثبت نشده است</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="activity in recentActivities"
        :key="activity.id"
        :class="`${getActivityColor(activity.type)} border border-transparent rounded-[24px] p-4 shadow-sm transition hover:shadow-md`"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-3xl bg-white text-2xl shadow-sm"
          >
            {{ getActivityIcon(activity.type) }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-900">
              {{ getActivityTypeText(activity.type) }}
            </p>
            <p class="mt-2 text-sm text-slate-600 truncate">{{ activity.title }}</p>
            <p v-if="activity.description" class="mt-2 text-xs text-slate-500 line-clamp-1">
              {{ activity.description }}
            </p>
          </div>
          <div class="whitespace-nowrap text-xs text-slate-500">
            {{ formatTime(activity.timestamp) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
