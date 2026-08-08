<script setup lang="ts">
import { ref, nextTick } from 'vue'
import html2pdf from 'html2pdf.js'

const props = defineProps<{
  project: any
}>()

const isGeneratingPdf = ref(false)
const showPdfTemplate = ref(false)
const pdfExportContainer = ref<HTMLElement | null>(null)

const getSurveyMethodLabel = (method: string | undefined | null) => {
  if (!method) return 'ثبت نشده'
  const labels: Record<string, string> = {
    ground: 'نقشه‌برداری زمینی',
    aerial: 'نقشه‌برداری هوایی / فتوگرامتری',
    gis: 'سیستم اطلاعات مکانی (GIS)',
  }
  return labels[method] || method
}

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
  if (!props.project) return

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
      filename: `admin-project-${props.project.id || 'document'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    } as any

    await html2pdf().set(options).from(element).save()
  } catch (error) {
    console.error('PDF generation error:', error)
    alert('خطا در تولید فایل PDF: ' + (error instanceof Error ? error.message : error))
  } finally {
    isGeneratingPdf.value = false
    showPdfTemplate.value = false
  }
}
</script>

<template>
  <div>
    <button
      type="button"
      @click="downloadPdf"
      :disabled="isGeneratingPdf"
      class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
    >
      <span
        v-if="isGeneratingPdf"
        class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
      />
      <span>{{ isGeneratingPdf ? 'در حال آماده‌سازی...' : 'دانلود PDF کامل پروژه' }}</span>
    </button>

    <div
      v-if="showPdfTemplate && project"
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
        <!-- هدر -->
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
              {{ project.title || 'بدون عنوان' }}
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
            گزارش مدیریتی پروژه
          </div>
        </div>

        <!-- کارفرما -->
        <div style="margin-bottom: 10px">
          <h2 style="font-size: 10px; font-weight: bold; color: #334155; margin-bottom: 3px">
            اطلاعات کارفرما:
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
                  نام
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; width: 30%">
                  {{ project.employer?.name || 'ثبت نشده' }}
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
                  شماره تماس
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; width: 30%">
                  {{ project.employer?.phone || 'ثبت نشده' }}
                </td>
              </tr>
            </tbody>
          </table>
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

        <!-- موقعیت و ابعاد -->
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
                  {{ project.mapScale || 'ثبت نشده' }}
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
                  تیپ عوارض زمین
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{ formatJsonList(project.terrainTypes) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- روش اجرا و تجهیزات -->
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
                  دسته‌بندی
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; width: 30%">
                  {{ project.category?.name || 'ثبت نشده' }}
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

        <!-- مالی -->
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
                  {{
                    project.minBudget
                      ? Number(project.minBudget).toLocaleString('fa-IR') + ' تومان'
                      : 'ثبت نشده'
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
                  حداکثر بودجه
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px">
                  {{
                    project.maxBudget
                      ? Number(project.maxBudget).toLocaleString('fa-IR') + ' تومان'
                      : 'ثبت نشده'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- آمار -->
        <div style="margin-bottom: 10px">
          <h2 style="font-size: 10px; font-weight: bold; color: #334155; margin-bottom: 3px">
            آمار پروژه:
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
                  تعداد بازدید
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; width: 30%">
                  {{ project.viewCount ?? 0 }}
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
                  تعداد پیشنهادها
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; width: 30%">
                  {{ project._count?.proposals ?? 0 }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- فوتر -->
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
          این سند به صورت خودکار از پنل مدیریت تولید شده است.
        </div>
      </div>
    </div>
  </div>
</template>
