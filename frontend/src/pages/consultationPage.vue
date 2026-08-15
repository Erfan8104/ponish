<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  MessageCircle,
  Phone,
  Mail,
  Compass,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plane,
  MapPin,
  Layers,
  HelpCircle,
} from 'lucide-vue-next'
import geokarMark from '@/assets/logo/geokar-logo-mark.svg'
import { consultationService } from '@/services/consultation.service'

type ProjectType = 'ground' | 'aerial' | 'gis' | 'unknown'
type ContactTime = 'morning' | 'noon' | 'evening'

const PROJECT_TYPES: { value: ProjectType; label: string; icon: any }[] = [
  { value: 'ground', label: 'زمینی', icon: MapPin },
  { value: 'aerial', label: 'هوایی (پهپاد)', icon: Plane },
  { value: 'gis', label: 'جی‌آی‌اس (GIS)', icon: Layers },
  { value: 'unknown', label: 'نمی‌دانم', icon: HelpCircle },
]

const form = ref({
  name: '',
  phone: '',
  email: '',
  projectType: '' as ProjectType | '',
  description: '',
  contactTime: '' as ContactTime | '',
})

const errors = ref<Record<string, string>>({})
const isLoading = ref(false)
const isSubmitted = ref(false)
const serverError = ref('')

const phonePattern = /^09\d{9}$/

const validate = (): boolean => {
  const next: Record<string, string> = {}

  if (!form.value.name.trim()) {
    next.name = 'لطفا نام خود را وارد کنید'
  }
  if (!phonePattern.test(form.value.phone.trim())) {
    next.phone = 'شماره موبایل باید به‌صورت 09xxxxxxxxx باشد'
  }
  if (!form.value.projectType) {
    next.projectType = 'نوع پروژه را انتخاب کنید'
  }
  if (!form.value.description.trim() || form.value.description.trim().length < 10) {
    next.description = 'توضیحات باید حداقل ۱۰ کاراکتر باشد'
  }

  errors.value = next
  return Object.keys(next).length === 0
}

const submit = async () => {
  serverError.value = ''
  if (!validate()) return

  try {
    await consultationService.createConsultation({
      name: form.value.name.trim(),
      phone: form.value.phone.trim(),
      email: form.value.email.trim() || undefined,
      projectType: form.value.projectType as 'ground' | 'aerial' | 'gis' | 'unknown',
      description: form.value.description.trim(),
      contactTime: form.value.contactTime || undefined,
    })

    isSubmitted.value = true

    isSubmitted.value = true
  } catch (err: any) {
    serverError.value =
      err?.response?.data?.message || 'ارسال درخواست با خطا مواجه شد. دوباره تلاش کنید.'
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    phone: '',
    email: '',
    projectType: '',
    description: '',
    contactTime: '',
  }
  errors.value = {}
  isSubmitted.value = false
}

const charCount = computed(() => form.value.description.length)
</script>

<template>
  <div class="min-h-screen bg-[#F3F4F1]" dir="rtl">
    <!-- Top bar -->
    <div class="border-b border-[#E3E4DF] bg-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <RouterLink to="/" class="inline-flex items-center gap-2.5">
          <img :src="geokarMark" alt="GeoKar" class="h-9 w-9 rounded-xl shadow-sm" />
          <span class="text-[15px] font-semibold text-gray-800">GeoKar</span>
        </RouterLink>
        <RouterLink
          to="/"
          class="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>بازگشت به صفحه اصلی</span>
          <ChevronRight :size="14" />
        </RouterLink>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <!-- Success state -->
      <div
        v-if="isSubmitted"
        class="bg-white rounded-xl border border-[#E3E4DF] shadow-sm p-10 text-center max-w-lg mx-auto"
      >
        <div
          class="w-14 h-14 rounded-full bg-[#E7F0EA] flex items-center justify-center mx-auto mb-5"
        >
          <CheckCircle2 :size="28" class="text-[#1F6F54]" />
        </div>
        <h2 class="text-lg font-bold text-gray-900 mb-2">درخواست شما ثبت شد</h2>
        <p class="text-sm text-gray-500 leading-relaxed mb-6">
          یکی از متخصصین نقشه‌برداری ما تا ۲۴ ساعت آینده با شماره‌ی
          <span class="font-medium text-gray-700 tracking-wide" dir="ltr">{{ form.phone }}</span>
          تماس می‌گیرد.
        </p>
        <div class="flex items-center justify-center gap-3">
          <RouterLink
            to="/"
            class="px-5 py-2.5 rounded-md text-sm font-medium text-white bg-gradient-to-br from-cyan-500 to-indigo-600 hover:opacity-90 transition"
          >
            بازگشت به صفحه اصلی
          </RouterLink>
          <button
            @click="resetForm"
            class="px-5 py-2.5 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
          >
            ثبت درخواست جدید
          </button>
        </div>
      </div>

      <!-- Main content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-[#E3E4DF] shadow-sm p-6 sm:p-8">
          <div class="flex items-center gap-2 text-[#1F6F54] mb-2">
            <MessageCircle :size="18" />
            <span class="text-xs font-semibold tracking-wide">مشاوره رایگان و بدون تعهد</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            قبل از ثبت پروژه، با یک متخصص نقشه‌برداری مشورت کنید
          </h1>
          <p class="text-sm text-gray-500 leading-relaxed mb-8">
            فرم زیر را تکمیل کنید تا کارشناسان ما بهترین روش اجرا، برآورد زمان و بودجه‌ی تقریبی
            پروژه‌ی شما را بررسی و در سریع‌ترین زمان ممکن با شما تماس بگیرند.
          </p>

          <form class="space-y-5" @submit.prevent="submit">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5"
                  >نام و نام خانوادگی</label
                >
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="مثال: علی رضایی"
                  class="w-full h-11 px-3.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                  :class="errors.name ? 'border-red-400' : ''"
                />
                <p v-if="errors.name" class="text-red-600 text-xs mt-1">{{ errors.name }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">شماره موبایل</label>
                <div class="relative">
                  <input
                    v-model="form.phone"
                    type="text"
                    placeholder="09123456789"
                    dir="ltr"
                    class="w-full h-11 px-3.5 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                    :class="errors.phone ? 'border-red-400' : ''"
                  />
                  <Phone
                    :size="15"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
                <p v-if="errors.phone" class="text-red-600 text-xs mt-1">{{ errors.phone }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                ایمیل <span class="text-gray-400">(اختیاری)</span>
              </label>
              <div class="relative">
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="example@email.com"
                  dir="ltr"
                  class="w-full h-11 px-3.5 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                />
                <Mail :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2.5">نوع پروژه</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  v-for="type in PROJECT_TYPES"
                  :key="type.value"
                  type="button"
                  @click="form.projectType = type.value"
                  class="flex flex-col items-center gap-1.5 rounded-md border py-3 text-xs font-medium transition-colors"
                  :class="
                    form.projectType === type.value
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  "
                >
                  <component :is="type.icon" :size="18" />
                  {{ type.label }}
                </button>
              </div>
              <p v-if="errors.projectType" class="text-red-600 text-xs mt-1.5">
                {{ errors.projectType }}
              </p>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-sm font-medium text-gray-700">توضیح کوتاه پروژه</label>
                <span class="text-[11px] text-gray-400">{{ charCount }} کاراکتر</span>
              </div>
              <textarea
                v-model="form.description"
                rows="4"
                placeholder="مثال: مساحی یک قطعه زمین کشاورزی حدود ۵ هکتار در استان البرز برای تفکیک سند..."
                class="w-full px-3.5 py-3 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                :class="errors.description ? 'border-red-400' : ''"
              ></textarea>
              <p v-if="errors.description" class="text-red-600 text-xs mt-1">
                {{ errors.description }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                بهترین زمان تماس <span class="text-gray-400">(اختیاری)</span>
              </label>
              <select
                v-model="form.contactTime"
                class="w-full h-11 px-3.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
              >
                <option value="">هر زمانی</option>
                <option value="morning">صبح (۹ تا ۱۲)</option>
                <option value="noon">ظهر (۱۲ تا ۱۶)</option>
                <option value="evening">عصر (۱۶ تا ۲۰)</option>
              </select>
            </div>

            <p v-if="serverError" class="text-red-600 text-sm">{{ serverError }}</p>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full h-12 rounded-md text-sm font-medium text-white bg-gradient-to-br from-cyan-500 to-indigo-600 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {{ isLoading ? 'در حال ارسال...' : 'ارسال درخواست مشاوره' }}
            </button>
          </form>
        </div>

        <!-- Sidebar -->
        <div class="space-y-5">
          <div class="bg-white rounded-xl border border-[#E3E4DF] shadow-sm p-6">
            <h3 class="text-sm font-semibold text-gray-800 mb-4">فرآیند مشاوره چطور است؟</h3>
            <ol class="space-y-4">
              <li class="flex gap-3">
                <span
                  class="w-6 h-6 shrink-0 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold flex items-center justify-center"
                  >۱</span
                >
                <span class="text-sm text-gray-600 leading-relaxed"
                  >فرم را تکمیل و ارسال می‌کنید</span
                >
              </li>
              <li class="flex gap-3">
                <span
                  class="w-6 h-6 shrink-0 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold flex items-center justify-center"
                  >۲</span
                >
                <span class="text-sm text-gray-600 leading-relaxed"
                  >یک متخصص نقشه‌برداری با شما تماس می‌گیرد</span
                >
              </li>
              <li class="flex gap-3">
                <span
                  class="w-6 h-6 shrink-0 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold flex items-center justify-center"
                  >۳</span
                >
                <span class="text-sm text-gray-600 leading-relaxed"
                  >روش اجرا و برآورد بودجه را دریافت می‌کنید</span
                >
              </li>
            </ol>
          </div>

          <div class="bg-white rounded-xl border border-[#E3E4DF] shadow-sm p-6">
            <div class="flex items-center gap-2 text-gray-700 mb-1.5">
              <Clock :size="16" />
              <span class="text-sm font-semibold">زمان پاسخ‌گویی</span>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed">
              معمولاً در کمتر از ۲۴ ساعت کاری با شما تماس گرفته می‌شود.
            </p>
          </div>

          <div class="bg-slate-900 rounded-xl p-6 text-white">
            <Compass :size="20" class="text-cyan-400 mb-2" />
            <p class="text-sm leading-relaxed text-slate-200">
              مطمئن نیستید پروژه‌تان زمینی، هوایی یا GIS است؟ همین گزینه‌ی «نمی‌دانم» را انتخاب
              کنید؛ تشخیص روش مناسب هم بخشی از مشاوره‌ی رایگان است.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
