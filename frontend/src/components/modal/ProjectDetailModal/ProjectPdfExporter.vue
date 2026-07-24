<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useProjectStore } from '@/stores/project.store'
import html2pdf from 'html2pdf.js'

import {
  FolderKanban,
  MapPinned,
  MapPin,
  Ruler,
  BadgeCheck,
  FileDown,
  Loader2,
} from 'lucide-vue-next'

const store = useProjectStore()
const project = computed(() => store.projectDetails)

const isGeneratingPdf = ref(false)
const showPdfTemplate = ref(false)
const pdfExportContainer = ref<HTMLElement | null>(null)

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

const getSurveyMethodLabel = (method: string | undefined | null) => {
  if (!method) return 'ثبت نشده'
  const labels: Record<string, string> = {
    ground: 'نقشه‌برداری زمینی',
    aerial: 'نقشه‌برداری هوایی / فتوگرامتری',
    gis: 'سیستم اطلاعات مکانی (GIS)',
  }
  return labels[method] || method
}

// تابع تبدیل تاریخ میلادی دیتابیس به فرمت خوانا و استاندارد فارسی
const formatPersianDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'ثبت نشده'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString

    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return dateString
  }
}

const formatJsonList = (data: any) => {
  if (!data) return 'ثبت نشده'
  if (Array.isArray(data)) {
    return data.length > 0 ? data.join('، ') : 'ثبت نشده'
  }
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) return parsed.length > 0 ? parsed.join('، ') : 'ثبت نشده'
    } catch {
      return data
    }
  }
  return 'ثبت نشده'
}

const downloadPdf = async () => {
  if (!project.value) return

  isGeneratingPdf.value = true
  showPdfTemplate.value = true

  await nextTick()

  const element = pdfExportContainer.value
  if (!element) {
    isGeneratingPdf.value = false
    showPdfTemplate.value = false
    alert('خطا: المان ساخت PDF پیدا نشد.')
    return
  }

  try {
    const options = {
      margin: 10,
      filename: `project-specs-${project.value.id || 'document'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    } as any

    await html2pdf().set(options).from(element).save()
  } catch (error) {
    console.error('Detailed PDF generation error:', error)
    alert('خطا در تولید فایل PDF: ' + (error instanceof Error ? error.message : error))
  } finally {
    isGeneratingPdf.value = false
    showPdfTemplate.value = false
  }
}
</script>

<template>
  <div v-if="project" class="space-y-8">
    <!-- دکمه دانلود -->
    <div class="flex justify-end">
      <button
        type="button"
        @click="downloadPdf"
        :disabled="isGeneratingPdf"
        class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
      >
        <Loader2 v-if="isGeneratingPdf" class="w-4 h-4 animate-spin" />
        <FileDown v-else class="w-4 h-4" />
        <span>{{
          isGeneratingPdf ? 'در حال آماده‌سازی PDF...' : 'دانلود مشخصات پروژه (PDF)'
        }}</span>
      </button>
    </div>

    <!-- اطلاعات اصلی صفحه -->
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

    <!-- بخش گرید اطلاعات در ظاهر سایت -->
    <div class="grid gap-6 lg:grid-cols-2">
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
        </div>
      </div>

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
        </div>
      </div>
    </div>

    <!-- 🌟 قالب کامل PDF با نمایش تمام فیلدهای دیتابیس -->
    <div
      v-if="showPdfTemplate"
      style="
        position: fixed;
        left: -9999px;
        top: 0;
        z-index: 9999;
        width: 800px;
        background: #ffffff;
      "
    >
      <div
        ref="pdfExportContainer"
        style="
          padding: 25px;
          background: #ffffff;
          color: #1e293b;
          direction: rtl;
          font-family: Tahoma, sans-serif;
          font-size: 10px;
        "
      >
        <!-- هدر پی دی اف -->
        <div
          style="
            border-bottom: 2px solid #cbd5e1;
            padding-bottom: 10px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <div>
            <h1 style="font-size: 15px; font-weight: bold; color: #0f172a; margin: 0">
              {{ project.title }}
            </h1>
            <p style="font-size: 9px; color: #64748b; margin: 3px 0 0 0">
              شناسه پروژه: {{ project.id }} | وضعیت: {{ project.status }} | تاریخ ثبت:
              {{ formatPersianDate(project.createdAt) }}
            </p>
          </div>
          <div
            style="
              background: #059669;
              color: #ffffff;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: bold;
            "
          >
            گزارش جامع مشخصات پروژه
          </div>
        </div>

        <!-- شرح پروژه -->
        <div style="margin-bottom: 10px">
          <h2 style="font-size: 10px; font-weight: bold; color: #334155; margin-bottom: 3px">
            شرح پروژه:
          </h2>
          <p
            style="
              font-size: 9px;
              color: #475569;
              line-height: 1.4;
              background: #f8fafc;
              padding: 6px;
              border-radius: 4px;
              border: 1px solid #e2e8f0;
              margin: 0;
            "
          >
            {{ project.description || 'توضیحاتی ثبت نشده است.' }}
          </p>
        </div>

        <!-- جدول ۱: موقعیت و مشخصات جغرافیایی -->
        <div style="margin-bottom: 10px">
          <h2 style="font-size: 10px; font-weight: bold; color: #334155; margin-bottom: 3px">
            اطلاعات موقعیت و ابعاد جغرافیایی:
          </h2>
          <table
            style="
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #cbd5e1;
              font-size: 9.5px;
              color: #334155;
            "
          >
            <tbody>
              <tr>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                    width: 20%;
                  "
                >
                  استان / شهر
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; width: 30%">
                  {{ project.province || '-' }} / {{ project.city || '-' }}
                </td>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                    width: 20%;
                  "
                >
                  آدرس دقیق
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; width: 30%">
                  {{ project.address || 'ثبت نشده' }}
                </td>
              </tr>
              <tr>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                  "
                >
                  سیستم مختصات (UTM Zone)
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ project.utmZone || 'ثبت نشده' }}
                </td>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                  "
                >
                  مقیاس نقشه
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ (project as any).mapScale || 'ثبت نشده' }}
                </td>
              </tr>
              <tr>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                  "
                >
                  نوع سنجش / ابعاد
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{
                    project.mappingType === 'corridor'
                      ? 'طول مسیر: ' + (project.corridorLength || 0) + ' کیلومتر'
                      : 'مساحت کل: ' + (project.calculatedArea || 0) + ' هکتار'
                  }}
                </td>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                  "
                >
                  تیپ عوارض زمین (Terrain)
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ formatJsonList(project.terrainTypes) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- جدول ۲: جزئیات روش اجرا، تجهیزات و دقت -->
        <div style="margin-bottom: 10px">
          <h2 style="font-size: 10px; font-weight: bold; color: #334155; margin-bottom: 3px">
            جزئیات روش اجرا و تجهیزات:
          </h2>
          <table
            style="
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #cbd5e1;
              font-size: 9.5px;
              color: #334155;
            "
          >
            <tbody>
              <tr>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                    width: 20%;
                  "
                >
                  نوع پروژه
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; width: 30%">
                  {{ getCategoryLabel(project.category?.name) }}
                </td>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                    width: 20%;
                  "
                >
                  روش اجرا
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; width: 30%">
                  {{ getSurveyMethodLabel(project.surveyMethod) }}
                </td>
              </tr>
              <tr>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                  "
                >
                  تجهیزات درخواستی
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ formatJsonList(project.requiredEquipment) }}
                </td>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                  "
                >
                  دقت مورد نیاز
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ project.requiredAccuracy || 'ثبت نشده' }}
                </td>
              </tr>
              <tr>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                  "
                >
                  فرمت‌های خروجی
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ formatJsonList(project.outputFormats) }}
                </td>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                  "
                >
                  روش انتخاب محدوده
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ project.areaSelectionMethod || 'ثبت نشده' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- جدول ۳: مشخصات فنی اختصاصی روش اجرا (بر اساس انتخاب کاربر) -->
        <div style="margin-bottom: 10px">
          <h2 style="font-size: 10px; font-weight: bold; color: #334155; margin-bottom: 3px">
            جزئیات فنی اختصاصی روش اجرا:
          </h2>
          <table
            style="
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #cbd5e1;
              font-size: 9.5px;
              color: #334155;
            "
          >
            <tbody>
              <!-- اگر روش زمینی باشد -->
              <tr v-if="project.surveyMethod === 'ground'">
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                    width: 25%;
                  "
                >
                  مشخصات فنی زمینی
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ formatJsonList((project as any).groundTechnicalSpecs) }}
                </td>
              </tr>
              <tr v-if="project.surveyMethod === 'ground' && (project as any).groundDescription">
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                  "
                >
                  توضیحات بخش زمینی
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ (project as any).groundDescription }}
                </td>
              </tr>

              <!-- اگر روش هوایی باشد -->
              <tr v-if="project.surveyMethod === 'aerial'">
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                    width: 25%;
                  "
                >
                  مشخصات پرواز / فتوگرامتری
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  مقیاس/پوشش: {{ (project as any).aerialScaleOption || 'ثبت نشده' }} <br />
                  مشخصات فنی: {{ formatJsonList((project as any).aerialTechnicalSpecs) }}
                </td>
              </tr>
              <tr v-if="project.surveyMethod === 'aerial' && (project as any).aerialDescription">
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                  "
                >
                  توضیحات بخش هوایی
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ (project as any).aerialDescription }}
                </td>
              </tr>

              <!-- اگر روش GIS باشد -->
              <tr v-if="project.surveyMethod === 'gis'">
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                    width: 25%;
                  "
                >
                  تحلیل‌ها و مشخصات GIS
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ formatJsonList((project as any).gisTechnicalSpecs) }}
                </td>
              </tr>
              <tr v-if="project.surveyMethod === 'gis' && (project as any).gisDescription">
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                  "
                >
                  توضیحات بخش GIS
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ (project as any).gisDescription }}
                </td>
              </tr>

              <!-- حالت پیش‌فرض در صورتی که متد خاصی انتخاب نشده باشد -->
              <tr v-if="!project.surveyMethod">
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                    width: 25%;
                  "
                >
                  جزئیات تخصصی
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">موردی ثبت نشده است.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- جدول ۴: اطلاعات مالی، بودجه و زمان‌بندی -->
        <div style="margin-bottom: 10px">
          <h2 style="font-size: 10px; font-weight: bold; color: #334155; margin-bottom: 3px">
            اطلاعات مالی و زمان‌بندی:
          </h2>
          <table
            style="
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #cbd5e1;
              font-size: 9.5px;
              color: #334155;
            "
          >
            <tbody>
              <tr>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                    width: 20%;
                  "
                >
                  نوع بودجه
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; width: 30%">
                  {{ project.budgetType || 'ثبت نشده' }}
                </td>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                    width: 20%;
                  "
                >
                  زمان تحویل
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; width: 30%">
                  {{ project.deliveryTime || 'ثبت نشده' }}
                </td>
              </tr>
              <tr>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                  "
                >
                  حداقل بودجه
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ project.minBudget ? project.minBudget + ' تومان' : 'ثبت نشده' }}
                </td>
                <td
                  style="
                    border: 1px solid #cbd5e1;
                    padding: 5px;
                    background: #f1f5f9;
                    font-weight: bold;
                  "
                >
                  حداکثر بودجه
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ project.maxBudget ? project.maxBudget + ' تومان' : 'ثبت نشده' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- فوتر صفحه PDF -->
        <div
          style="
            margin-top: 12px;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            text-align: center;
            font-size: 8.5px;
            color: #94a3b8;
          "
        >
          این سند به صورت خودکار از سامانه تولید شده است.
        </div>
      </div>
    </div>
  </div>
</template>
