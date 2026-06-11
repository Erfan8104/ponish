<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

const services = [
  'طراحی اپلیکیشن موبایل',
  'طراحی وب سایت',
  'اسکریپت نویسی، اتوماسیون و تست نویسی',
  'طراحی و توسعه بازی',
  'برنامه نویسی و توسعه نرم افزار',
  'توسعه شبکه، سرور و امنیت وب',
  'طراحی فروشگاه آنلاین',
  'طراحی قالب وردپرس',
  'طراحی رابط کاربری UI/UX',
  'تصویرسازی',
]

const skillsDatabase = [
  'الگوریتم',
  'امنیت وب',
  'ام‌کیو‌ال۴ (MQL4)',
  'آنگولار (Angular.js)',
  'انیمیشن',
  'اوپن‌سی‌وی (OpenCV)',
  'اکسس (Microsoft Access)',
  'اکسل (Excel)',
  'ایلوستریتور (Adobe Illustrator)',
  'طراحی کاراکتر',
  'رسم',
  'عکاسی',
  'نقاشی دیجیتال',
]

const allSteps = [
  {
    id: 1,
    question: 'می‌خواهید چه کاری برای شما انجام شود؟',
    subQuestion: 'سرویس مورد نظرتان را جستجو کنید',
    placeholder: 'انتخاب یا جستجوی سرویس...',
    type: 'search',
    model: 'category',
  },
  {
    id: 2,
    question: 'یک عنوان خوب برای پروژه بنویسید.',
    subQuestion: '',
    type: 'title-input',
    model: 'title',
  },
  {
    id: 3,
    question: 'درباره پروژه توضیح دهید.',
    subQuestion: '',
    type: 'description-input',
    model: 'description',
  },
  {
    id: 4,
    question: 'به چه مهارت‌هایی نیاز دارید؟',
    subQuestion: '',
    placeholder: 'جستجو...',
    type: 'skills-input',
    model: 'skills',
  },
  {
    id: 5,
    question: 'اولویت و بودجه را مشخص کنید.',
    subQuestion:
      'با انتخاب اولویت پروژه، فریلنسر از هدف شما مطلع می‌شود و می‌تواند خروجی بهتری را به شما ارائه کند.',
    type: 'budget-input',
    model: 'budget',
  },
  {
    id: 6,
    question: 'پیش نمایش پروژه شما',
    subQuestion: '',
    type: 'preview-invoice',
    model: 'invoice',
  },
]

const activeSteps = ref([allSteps[0]])
const isDropdownOpen = ref<boolean>(false)
const isSkillsDropdownOpen = ref<boolean>(false)
const searchQuery = ref<string>('')
const skillSearchQuery = ref<string>('')

const uploadedFiles = ref<File[]>([])
const selectedSkills = ref<string[]>([])

const formData = reactive<Record<string, any>>({
  category: '',
  title: '',
  description: '',
  skills: [],
  priority: 'balanced',
  budgetType: 'custom',
  minBudget: '',
  maxBudget: '',
})

const baseProjectPrice = 199000
const vatTaxRate = 0.1

const vatTaxAmount = computed(() => Math.round(baseProjectPrice * vatTaxRate))
const totalInvoiceAmount = computed(() => baseProjectPrice + vatTaxAmount.value)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fa-IR').format(value)
}

const filteredServices = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return services
  return services.filter((service) => service.toLowerCase().includes(query))
})

const filteredSkills = computed(() => {
  const availableSkills = skillsDatabase.filter((skill) => !selectedSkills.value.includes(skill))
  const query = skillSearchQuery.value.trim().toLowerCase()
  if (!query) return availableSkills
  return availableSkills.filter((skill) => skill.toLowerCase().includes(query))
})

const selectService = (service: string, modelKey: string): void => {
  searchQuery.value = service
  formData[modelKey] = service
  isDropdownOpen.value = false
}

const selectSkill = (skill: string) => {
  if (!selectedSkills.value.includes(skill)) {
    selectedSkills.value.push(skill)
    formData.skills = [...selectedSkills.value]
  }
  skillSearchQuery.value = ''
}

const removeSkill = (skillToRemove: string) => {
  selectedSkills.value = selectedSkills.value.filter((skill) => skill !== skillToRemove)
  formData.skills = [...selectedSkills.value]
}

const closeDropdowns = () => {
  isDropdownOpen.value = false
  isSkillsDropdownOpen.value = false
}

// حل مشکل رفرنس: پیدا کردن مستقیم المان در DOM با شناسه یکتا
const triggerFileSelect = () => {
  const element = document.getElementById('project-file-hidden-input') as HTMLInputElement
  if (element) {
    element.click()
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const filesArray = Array.from(target.files)
    uploadedFiles.value = [...uploadedFiles.value, ...filesArray]
    target.value = ''
  }
}

const handleDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const filesArray = Array.from(event.dataTransfer.files)
    uploadedFiles.value = [...uploadedFiles.value, ...filesArray]
  }
}

const removeFile = (indexToRemove: number) => {
  uploadedFiles.value = uploadedFiles.value.filter((_, idx) => idx !== indexToRemove)
}

onMounted(() => {
  window.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns)
})

const isStepValid = (step: (typeof allSteps)[0]): boolean => {
  if (step.type === 'skills-input') {
    return selectedSkills.value.length > 0
  }
  if (step.type === 'budget-input') {
    if (formData.budgetType === 'custom') {
      return !!formData.minBudget && !!formData.maxBudget
    }
    return true
  }
  if (step.type === 'preview-invoice') {
    return true
  }
  return !!formData[step.model]
}

const nextStep = (): void => {
  const currentStepCount = activeSteps.value.length

  if (currentStepCount < allSteps.length) {
    activeSteps.value.push(allSteps[currentStepCount])

    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      })
    }, 120)
  } else {
    console.log('ثبت نهایی پروژه:', { ...formData, files: uploadedFiles.value })
  }
}
</script>

<template>
  <main class="bg-gray-50 min-h-screen py-10 px-4 select-none">
    <div class="max-w-6xl mx-auto">
      <div class="mb-10 text-right" style="direction: rtl">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">ایجاد یک پروژه</h1>
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-[#008f55] tracking-widest"
            >{{ activeSteps.length }} از {{ allSteps.length }}</span
          >
          <div class="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-[#008f55] transition-all duration-500"
              :style="{ width: `${(activeSteps.length / allSteps.length) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div
          v-if="activeSteps[activeSteps.length - 1].type !== 'preview-invoice'"
          class="lg:col-span-1 lg:sticky lg:top-10 order-2 lg:order-1"
        >
          <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div class="relative group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600"
                alt="ثبت پروژه"
                class="w-full h-auto aspect-video object-cover"
              />
              <div
                class="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-all"
              >
                <div
                  class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 text-[#008f55] mr-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="p-4 text-center" style="direction: rtl">
              <h3 class="text-sm font-bold text-gray-700 mb-1">چگونه در پونیشا پروژه ثبت کنم؟</h3>
              <p class="text-xs text-gray-400">حتما ویدیو بالا را مشاهده نمایید.</p>
            </div>
          </div>
        </div>

        <div
          :class="
            activeSteps[activeSteps.length - 1].type === 'preview-invoice'
              ? 'lg:col-span-3 max-w-4xl mx-auto w-full'
              : 'lg:col-span-2'
          "
          class="space-y-8 order-1 lg:order-2"
        >
          <div
            v-for="(step, index) in activeSteps"
            :key="step.id"
            class="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm transition-all duration-500 relative animate-in"
            :class="{
              'opacity-50 pointer-events-none scale-[0.98]': index < activeSteps.length - 1,
            }"
            style="direction: rtl"
          >
            <div class="text-[11px] font-bold text-gray-400 mb-1 tabular-nums">
              {{ step.id }} از {{ allSteps.length }}
            </div>

            <h2 class="text-lg font-bold text-gray-800 mb-2">{{ step.question }}</h2>
            <p v-if="step.subQuestion" class="text-xs text-gray-400 mb-5">{{ step.subQuestion }}</p>

            <div v-if="step.type === 'search'" class="relative">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="step.placeholder"
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pr-10 text-sm focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-right"
                  @focus="isDropdownOpen = true"
                  @click.stop="isDropdownOpen = true"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400 absolute right-3 top-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              <div
                v-if="isDropdownOpen"
                class="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto text-right"
              >
                <div
                  v-for="service in filteredServices"
                  :key="service"
                  @click="selectService(service, step.model)"
                  class="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                >
                  {{ service }}
                </div>
              </div>
            </div>

            <div v-if="step.type === 'title-input'" class="relative text-right">
              <label class="block text-xs font-bold text-gray-500 mb-2 mr-1">عنوان پروژه</label>
              <input
                v-model="formData[step.model]"
                type="text"
                placeholder="عنوان پروژه خود را وارد کنید..."
                class="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
              />
            </div>

            <div v-if="step.type === 'description-input'" class="relative text-right">
              <label class="block text-xs font-bold text-gray-500 mb-2 mr-1"
                >پروژه خود را توضیح دهید</label
              >
              <textarea
                v-model="formData[step.model]"
                rows="4"
                placeholder="توضیحات کامل پروژه..."
                class="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#008f55] outline-none transition-all resize-none"
              ></textarea>

              <div
                @dragover.prevent
                @drop.prevent="handleDrop"
                class="mt-6 border border-dashed border-gray-200 bg-gray-50/40 rounded-xl p-6 text-center"
              >
                <input
                  type="file"
                  id="project-file-hidden-input"
                  multiple
                  class="hidden"
                  @change="handleFileChange"
                />

                <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div class="text-right sm:order-1 order-2">
                    <p class="text-[11px] text-gray-500 font-medium mb-1">
                      فایل‌ها و تصاویری که به توضیحات شما کمک می‌کند را اینجا رها کنید.
                    </p>
                    <div class="flex items-center gap-4 text-[10px] text-gray-400">
                      <span>حداکثر تعداد فایل: ۵۰</span>
                      <span>حداکثر حجم هر فایل: ۱۵ MB</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="triggerFileSelect"
                    class="bg-white border border-gray-200 text-gray-700 text-[11px] font-bold px-4 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    آپلود فایل
                  </button>
                </div>

                <div v-if="uploadedFiles.length > 0" class="mt-5 text-right flex flex-wrap gap-2">
                  <div
                    v-for="(file, fIdx) in uploadedFiles"
                    :key="fIdx"
                    class="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg pl-2 pr-3 py-1.5 text-[11px] text-gray-700 shadow-sm"
                  >
                    <span class="font-medium truncate max-w-[180px]">{{ file.name }}</span>
                    <span class="text-gray-400 text-[10px]"
                      >({{ (file.size / (1024 * 1024)).toFixed(2) }} MB)</span
                    >
                    <button
                      type="button"
                      @click="removeFile(fIdx)"
                      class="text-red-400 hover:text-red-600 cursor-pointer mr-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="step.type === 'skills-input'" class="relative text-right">
              <input
                v-model="skillSearchQuery"
                type="text"
                :placeholder="step.placeholder"
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pr-10 text-sm focus:border-[#008f55] outline-none text-right"
                @focus="isSkillsDropdownOpen = true"
                @click.stop="isSkillsDropdownOpen = true"
              />
              <div
                v-if="isSkillsDropdownOpen"
                class="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto text-right"
              >
                <div
                  v-for="skill in filteredSkills"
                  :key="skill"
                  @click.stop="selectSkill(skill)"
                  class="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  {{ skill }}
                </div>
              </div>
              <div v-if="selectedSkills.length > 0" class="mt-4 flex flex-wrap gap-2 justify-start">
                <div
                  v-for="skill in selectedSkills"
                  :key="skill"
                  class="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg pl-2 pr-3 py-1.5 text-xs text-gray-600"
                >
                  <span>{{ skill }}</span>
                  <button
                    type="button"
                    @click="removeSkill(skill)"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div v-if="step.type === 'budget-input'" class="relative text-right">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <label
                  class="border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all"
                  :class="
                    formData.priority === 'price'
                      ? 'border-[#008f55] bg-emerald-50/20 ring-4 ring-emerald-50/50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  "
                >
                  <div class="flex items-center justify-between gap-3">
                    <span class="text-xs font-bold text-gray-700"
                      >برای من قیمت بالاترین درجه اهمیت را دارد</span
                    >
                    <input
                      type="radio"
                      value="price"
                      v-model="formData.priority"
                      class="accent-[#008f55] h-4 w-4 shrink-0"
                    />
                  </div>
                </label>
                <label
                  class="border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all"
                  :class="
                    formData.priority === 'quality'
                      ? 'border-[#008f55] bg-emerald-50/20 ring-4 ring-emerald-50/50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  "
                >
                  <div class="flex items-center justify-between gap-3">
                    <span class="text-xs font-bold text-gray-700"
                      >برای من کیفیت بالاترین درجه اهمیت را دارد</span
                    >
                    <input
                      type="radio"
                      value="quality"
                      v-model="formData.priority"
                      class="accent-[#008f55] h-4 w-4 shrink-0"
                    />
                  </div>
                </label>
                <label
                  class="border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all"
                  :class="
                    formData.priority === 'balanced'
                      ? 'border-[#008f55] bg-[#008f55] text-white'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  "
                >
                  <div class="flex items-center justify-between gap-3">
                    <span
                      class="text-xs font-bold"
                      :class="formData.priority === 'balanced' ? 'text-white' : 'text-gray-700'"
                      >برای من ترکیبی از کیفیت و قیمت اهمیت دارد</span
                    >
                    <input
                      type="radio"
                      value="balanced"
                      v-model="formData.priority"
                      class="accent-[#008f55] h-4 w-4 shrink-0"
                    />
                  </div>
                </label>
              </div>

              <div class="mb-5">
                <label class="block text-xs font-bold text-gray-500 mb-2 mr-1">انتخاب بودجه</label>
                <select
                  v-model="formData.budgetType"
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#008f55] outline-none appearance-none cursor-pointer text-right"
                >
                  <option value="custom">بازه دلخواه</option>
                  <option value="project">پروژه بزرگ (بیش از ۵۰ میلیون)</option>
                </select>
              </div>

              <div
                v-if="formData.budgetType === 'custom'"
                class="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-2 mr-1"
                    >حداقل بودجه (تومان)</label
                  >
                  <input
                    v-model="formData.minBudget"
                    type="number"
                    placeholder="حداقل قیمت"
                    class="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#008f55] text-right tabular-nums"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-2 mr-1"
                    >حداکثر بودجه (تومان)</label
                  >
                  <input
                    v-model="formData.maxBudget"
                    type="number"
                    placeholder="حداکثر قیمت"
                    class="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#008f55] text-right tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div v-if="step.type === 'preview-invoice'" class="space-y-10" style="direction: rtl">
              <div
                class="border border-gray-200/80 rounded-2xl p-6 bg-white shadow-sm space-y-4 max-w-2xl mx-auto"
              >
                <div class="text-[#008f55] font-bold text-sm">
                  {{ formData.category || 'تصویر سازی' }}
                </div>
                <h3 class="text-base font-bold text-gray-800">
                  {{ formData.title || 'ساخت تصویر با هوش مصنوعی' }}
                </h3>

                <div
                  v-if="selectedSkills.length > 0"
                  class="flex flex-wrap gap-1.5 items-center text-xs text-gray-500"
                >
                  <span class="font-medium">مهارت‌ها:</span>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="(skill, sIdx) in selectedSkills"
                      :key="sIdx"
                      class="bg-gray-50 border border-gray-100 rounded px-2 py-0.5 text-[11px]"
                    >
                      {{ skill }}
                    </span>
                  </div>
                </div>

                <div class="pt-2 flex items-center gap-1.5 text-xs font-bold text-amber-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 shrink-0 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span v-if="formData.priority === 'price'">قیمت بالاترین درجه اهمیت را دارد</span>
                  <span v-else-if="formData.priority === 'quality'"
                    >کیفیت بالاترین درجه اهمیت را دارد</span
                  >
                  <span v-else>ترکیبی از کیفیت و قیمت اهمیت دارد</span>
                </div>
              </div>

              <div class="max-w-2xl mx-auto pt-4 border-t border-gray-100">
                <h3 class="text-lg font-bold text-gray-800 mb-6">صورتحساب</h3>

                <div class="space-y-4 text-sm font-medium text-gray-600">
                  <div class="flex justify-between items-center py-1">
                    <span>ایجاد پروژه</span>
                    <span class="tabular-nums text-gray-800 font-bold"
                      >{{ formatCurrency(baseProjectPrice) }}
                      <span class="text-xs font-normal text-gray-400 mr-0.5">تومان</span></span
                    >
                  </div>

                  <div class="flex justify-between items-center py-1">
                    <span>مالیات بر ارزش افزوده</span>
                    <span class="tabular-nums text-gray-800 font-bold"
                      >{{ formatCurrency(vatTaxAmount) }}
                      <span class="text-xs font-normal text-gray-400 mr-0.5">تومان</span></span
                    >
                  </div>

                  <div class="border-t border-gray-100 my-2"></div>

                  <div
                    class="flex justify-between items-center text-base font-bold text-gray-900 py-2"
                  >
                    <span>مبلغ قابل پرداخت</span>
                    <span class="text-xl font-black text-gray-900 tabular-nums">
                      {{ formatCurrency(totalInvoiceAmount) }}
                      <span class="text-xs font-bold text-gray-500 mr-0.5">تومان</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="index === activeSteps.length - 1" class="mt-8 flex justify-center">
              <button
                @click="nextStep"
                :disabled="!isStepValid(step)"
                :class="[
                  'w-full max-w-2xl py-3 rounded-xl text-sm font-bold transition-all shadow-sm text-center',
                  isStepValid(step)
                    ? 'bg-[#008f55] hover:bg-[#007a48] text-white cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                ]"
              >
                {{ activeSteps.length === allSteps.length ? 'تایید و ادامه' : 'مرحله بعد' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.animate-in {
  animation: animate-in 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
