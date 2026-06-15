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
  <div class="bg-white rounded-2xl p-6 border border-gray-200">
    <h2 class="text-xl font-bold text-gray-800 mb-6">فعالیت‌های اخیر</h2>

    <div v-if="recentActivities.length === 0" class="py-8 text-center">
      <p class="text-gray-500">هیچ فعالیتی ثبت نشده است</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="activity in recentActivities"
        :key="activity.id"
        :class="`${getActivityColor(activity.type)} border rounded-lg p-4 transition-all hover:shadow-md`"
      >
        <div class="flex items-start gap-3">
          <span class="text-2xl">{{ getActivityIcon(activity.type) }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800 text-sm">
              {{ getActivityTypeText(activity.type) }}
            </p>
            <p class="text-gray-700 text-sm mt-1 truncate">{{ activity.title }}</p>
            <p v-if="activity.description" class="text-gray-600 text-xs mt-1 line-clamp-1">
              {{ activity.description }}
            </p>
            <p class="text-gray-500 text-xs mt-2">{{ formatTime(activity.timestamp) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
