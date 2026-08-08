<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjectDetailApi } from '@/services/admin.service'
import StatusBadge from '@/components/admin/ui/StatusBadge.vue'
import AdminCard from '@/components/admin/ui/AdminCard.vue'
import AdminProjectPdfExporter from '@/components/admin/ui/AdminProjectPdfExporter.vue'
import AdminBoundaryMapView from '@/components/admin/ui/AdminBoundaryMapView.vue'

const route = useRoute()
const router = useRouter()
const projectId = Number(route.params.id)

const loading = ref(true)
const project = ref<any>(null)
const errorMessage = ref('')
const activeTab = ref('info')

const tabs = [
  { key: 'info', label: 'اطلاعات پروژه' },
  { key: 'proposals', label: 'پیشنهادها' },
  { key: 'contract', label: 'قرارداد' },
  { key: 'attachments', label: 'پیوست‌ها' },
  { key: 'skills', label: 'مهارت‌ها' },
  { key: 'map', label: 'نقشه' },
]

async function fetchDetail() {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await getProjectDetailApi(projectId)
    if (data?.success) {
      project.value = data.project
    } else {
      errorMessage.value = data?.message || 'خطا در دریافت اطلاعات'
    }
  } catch (error) {
    errorMessage.value = 'خطا در دریافت اطلاعات پروژه'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)

function goBack() {
  router.push('/admin/projects')
}

function formatMoney(n: any) {
  if (n === null || n === undefined) return '—'
  return Number(n).toLocaleString('fa-IR') + ' تومان'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-5xl mx-auto space-y-6">
      <button
        class="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        @click="goBack"
      >
        ← بازگشت به لیست پروژه‌ها
      </button>

      <div v-if="loading" class="flex justify-center py-24">
        <div
          class="w-8 h-8 border-2 border-gray-200 border-t-[#008f55] rounded-full animate-spin"
        />
      </div>

      <div v-else-if="errorMessage" class="text-center py-24 text-sm text-red-500">
        {{ errorMessage }}
      </div>

      <div v-else-if="project" class="space-y-6">
        <!-- هدر -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              {{ project.title || 'بدون عنوان' }}
              <span v-if="project.isFeatured" class="text-amber-500 text-sm">⭐ ویژه</span>
            </h1>
            <p class="text-xs text-gray-400 mt-1">
              کارفرما: {{ project.employer?.name || project.employer?.phone || '—' }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <StatusBadge :status="project.status" size="md" />
            <AdminProjectPdfExporter :project="project" />
          </div>
        </div>
        <!-- کارت‌های آماری -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AdminCard>
            <p class="text-[11px] text-gray-400">تعداد بازدید</p>
            <p class="text-lg font-bold text-gray-800 mt-1">{{ project.viewCount ?? 0 }}</p>
          </AdminCard>
          <AdminCard>
            <p class="text-[11px] text-gray-400">تعداد پیشنهادها</p>
            <p class="text-lg font-bold text-gray-800 mt-1">{{ project._count?.proposals ?? 0 }}</p>
          </AdminCard>
          <AdminCard>
            <p class="text-[11px] text-gray-400">بودجه</p>
            <p class="text-sm font-bold text-gray-800 mt-1">
              {{ project.budgetType === 'negotiable' ? 'توافقی' : formatMoney(project.maxBudget) }}
            </p>
          </AdminCard>
          <AdminCard>
            <p class="text-[11px] text-gray-400">مساحت محاسبه‌شده</p>
            <p class="text-sm font-bold text-gray-800 mt-1">{{ project.calculatedArea ?? '—' }}</p>
          </AdminCard>
        </div>

        <!-- تب‌ها -->
        <div class="flex gap-1 border-b border-gray-200 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors"
            :class="
              activeTab === tab.key
                ? 'border-[#008f55] text-[#008f55]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            "
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- محتوای تب: اطلاعات پروژه -->
        <AdminCard v-if="activeTab === 'info'" title="اطلاعات پروژه">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div><span class="text-gray-400">توضیحات:</span> {{ project.description || '—' }}</div>
            <div>
              <span class="text-gray-400">استان/شهر:</span>
              {{ [project.province, project.city].filter(Boolean).join('، ') || '—' }}
            </div>
            <div><span class="text-gray-400">آدرس:</span> {{ project.address || '—' }}</div>
            <div>
              <span class="text-gray-400">دسته‌بندی:</span> {{ project.category?.name || '—' }}
            </div>
            <div>
              <span class="text-gray-400">نوع نقشه‌برداری:</span> {{ project.mappingType || '—' }}
            </div>
            <div>
              <span class="text-gray-400">دقت مورد نیاز:</span>
              {{ project.requiredAccuracy || '—' }}
            </div>
            <div><span class="text-gray-400">مقیاس نقشه:</span> {{ project.mapScale || '—' }}</div>
            <div>
              <span class="text-gray-400">زمان تحویل:</span> {{ project.deliveryTime || '—' }}
            </div>
            <div>
              <span class="text-gray-400">روش نقشه‌برداری:</span> {{ project.surveyMethod || '—' }}
            </div>
            <div>
              <span class="text-gray-400">طول کریدور:</span> {{ project.corridorLength ?? '—' }}
            </div>
            <div><span class="text-gray-400">منطقه UTM:</span> {{ project.utmZone || '—' }}</div>
            <div>
              <span class="text-gray-400">تاریخ ثبت:</span>
              {{ new Date(project.createdAt).toLocaleDateString('fa-IR') }}
            </div>
          </div>
        </AdminCard>

        <!-- محتوای تب: پیشنهادها -->
        <AdminCard v-else-if="activeTab === 'proposals'" title="پیشنهادها">
          <div v-if="project.proposals?.length" class="divide-y divide-gray-100">
            <div
              v-for="pr in project.proposals"
              :key="pr.id"
              class="py-3 flex justify-between items-center text-xs"
            >
              <div>
                <p class="font-semibold">
                  {{ pr.freelancer?.name || pr.freelancer?.phone || '—' }}
                </p>
                <p class="text-gray-400 mt-0.5">
                  {{ formatMoney(pr.amount) }} · تحویل در {{ pr.deliveryDays }} روز
                </p>
                <p class="text-gray-400 mt-0.5 line-clamp-1">{{ pr.coverLetter }}</p>
              </div>
              <StatusBadge :status="pr.status" />
            </div>
          </div>
          <p v-else class="text-xs text-gray-400">پیشنهادی برای این پروژه ثبت نشده.</p>
        </AdminCard>

        <!-- محتوای تب: قرارداد -->
        <AdminCard v-else-if="activeTab === 'contract'" title="قرارداد">
          <div v-if="project.contract" class="space-y-3 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-400">فریلنسر:</span>
              <span>
                {{ project.contract.freelancer?.name || project.contract.freelancer?.phone || '—' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">مبلغ کل قرارداد:</span>
              <span>{{ formatMoney(project.contract.totalAmount) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">وضعیت قرارداد:</span>
              <StatusBadge :status="project.contract.status" />
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">تاریخ شروع:</span>
              <span>{{ new Date(project.contract.startedAt).toLocaleDateString('fa-IR') }}</span>
            </div>
            <div v-if="project.contract.completedAt" class="flex justify-between">
              <span class="text-gray-400">تاریخ اتمام:</span>
              <span>{{ new Date(project.contract.completedAt).toLocaleDateString('fa-IR') }}</span>
            </div>

            <div v-if="project.contract.milestones?.length" class="pt-3 border-t border-gray-100">
              <p class="text-gray-400 mb-2">مایلستون‌ها</p>
              <div
                v-for="m in project.contract.milestones"
                :key="m.id"
                class="flex justify-between items-center py-2"
              >
                <div>
                  <p class="font-medium">{{ m.title }}</p>
                  <p class="text-gray-400 mt-0.5">{{ formatMoney(m.amount) }}</p>
                </div>
                <StatusBadge :status="m.status" />
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-gray-400">قراردادی برای این پروژه ثبت نشده.</p>
        </AdminCard>

        <!-- محتوای تب: پیوست‌ها -->
        <!-- محتوای تب: پیوست‌ها -->
        <AdminCard v-else-if="activeTab === 'attachments'" title="پیوست‌ها">
          <div v-if="project.attachments?.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <a
              v-for="att in project.attachments"
              :key="att.id"
              :href="att.fileUrl"
              target="_blank"
              class="p-3 border border-gray-100 rounded-xl text-xs hover:bg-gray-50 transition-colors truncate"
              >📎 {{ att.fileName }}</a
            >
          </div>
          <p v-else class="text-xs text-gray-400">پیوستی برای این پروژه ثبت نشده.</p>
        </AdminCard>

        <!-- محتوای تب: مهارت‌ها -->
        <AdminCard v-else-if="activeTab === 'skills'" title="مهارت‌های مورد نیاز">
          <div v-if="project.skills?.length" class="flex flex-wrap gap-2">
            <span
              v-for="s in project.skills"
              :key="s.id"
              class="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs"
            >
              {{ s.skill.name }}
            </span>
          </div>
          <p v-else class="text-xs text-gray-400">مهارتی برای این پروژه ثبت نشده.</p>
        </AdminCard>

        <!-- محتوای تب: نقشه -->
        <AdminCard v-else-if="activeTab === 'map'" title="نقشه و محدوده">
          <AdminBoundaryMapView
            v-if="project.geoJson"
            :geo-json="project.geoJson"
            :mapping-type="project.mappingType"
          />
          <p v-else class="text-xs text-gray-400">محدوده‌ای برای این پروژه ثبت نشده.</p>
        </AdminCard>
      </div>
    </div>
  </div>
</template>
