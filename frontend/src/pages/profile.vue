<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from 'vue-toastification'
import {
  User,
  Phone,
  Mail,
  Save,
  RotateCcw,
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  GraduationCap,
  Wrench,
  Briefcase,
  Camera,
} from 'lucide-vue-next'
import { useRoleStore } from '@/stores/role.store'
import { ProfileService } from '@/services/profile.service'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const roleStore = useRoleStore()

// تشخیص کارفرما بودن
const isEmployee = computed<boolean>(() => {
  return roleStore.role === 'employer'
})

// فرم شامل تمام فیلدها و عکس پروفایل
const form = reactive({
  // فیلدهای مشترک
  name: authStore.name || '',
  phone: authStore.phone || '',
  email: authStore.email || '',
  avatar: authStore.avatar || '', // خواندن عکس از استور

  // فیلدهای کارفرما
  province: authStore.province || '',
  city: authStore.city || '',
  company: authStore.company || '',

  // فیلدهای فریلنسر
  birthDate: authStore.birthDate || '',
  birthPlace: authStore.birthPlace || '',
  freelancerProvince: authStore.freelancerProvince || '',
  freelancerCity: authStore.freelancerCity || '',
  education: authStore.education || '',
  skills: authStore.skills || '',
  experience: authStore.experience || '',
})

// اعتبار سنجی ساده اولیه (فقط نام و تلفن)
const isFormValid = computed(() => {
  return form.name.trim().length > 0 && form.phone.trim().length > 0
})

const avatarLabel = computed(() => {
  const source = form.name || form.phone || '؟'
  return source.trim().charAt(0).toUpperCase()
})

const fileInputRef = ref<HTMLInputElement | null>(null)

// ۱. باز کردن گالری/پنجره فایل با کلیک روی آیکون دوربین
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// ۲. خواندن فایل انتخابی و تولید فرمت Base64 برای پیش‌نمایش موقت
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Image = e.target?.result as string
      form.avatar = base64Image // قرار دادن در فرم جهت نمایش آنی به کاربر
      toast.success('عکس پروفایل انتخاب شد. برای ثبت نهایی "ذخیره تغییرات" را بزنید.')
    }
    reader.readAsDataURL(file)
  }
}

// ذخیره نهایی در سرور و اعمال مدیریت هوشمند در پینیا
const saveProfile = async () => {
  if (!isFormValid.value) {
    toast.error('لطفاً نام و شماره تماس را وارد کنید')
    return
  }

  const currentRole = roleStore.role as 'employer' | 'freelancer'

  try {
    // ۱. آماده‌سازی پِیلود کامل برای لایه سرویس
    const fullPayload: UpdateProfilePayload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      role: currentRole,
      province: form.province.trim(),
      city: form.city.trim(),
      company: form.company.trim(),
      birthDate: form.birthDate.trim(),
      birthPlace: form.birthPlace.trim(),
      freelancerProvince: form.freelancerProvince.trim(),
      freelancerCity: form.freelancerCity.trim(),
      education: form.education.trim(),
      skills: form.skills.trim(),
      experience: form.experience.trim(),
      avatar: form.avatar,
    }

    // ۲. ارسال به لایه سرویس (سرویس داده‌های نامربوط به این نقش را فیلتر می‌کند)
    await ProfileService.updateProfile(fullPayload)

    // ۳. آپدیت هوشمند استور پینیا (ارسال داده‌ها همراه با نقش کاربر به عنوان آرگومان دوم)
    authStore.updateProfile(
      {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        province: form.province.trim(),
        city: form.city.trim(),
        company: form.company.trim(),
        birthDate: form.birthDate.trim(),
        birthPlace: form.birthPlace.trim(),
        freelancerProvince: form.freelancerProvince.trim(),
        freelancerCity: form.freelancerCity.trim(),
        education: form.education.trim(),
        skills: form.skills.trim(),
        experience: form.experience.trim(),
        avatar: form.avatar,
      },
      currentRole, // 🌟 پاس دادن نقش برای پاک‌سازی دیتای هرز در پینیا و لوکال استوری
    )

    // ۴. سینک کردن فرم با تغییرات و پاک‌سازی‌های احتمالی استور
    resetForm()

    toast.success('اطلاعات پروفایل با موفقیت روی سرور ذخیره شد')
  } catch (error) {
    console.error(error)
    toast.error('خطا در ارتباط با سرور! اطلاعات ذخیره نشد.')
  }
}

// بازنشانی فرم به آخرین اطلاعات معتبر موجود در استور
const resetForm = () => {
  form.name = authStore.name || ''
  form.phone = authStore.phone || ''
  form.email = authStore.email || ''
  form.avatar = authStore.avatar || ''
  form.province = authStore.province || ''
  form.city = authStore.city || ''
  form.company = authStore.company || ''
  form.birthDate = authStore.birthDate || ''
  form.birthPlace = authStore.birthPlace || ''
  form.freelancerProvince = authStore.freelancerProvince || ''
  form.freelancerCity = authStore.freelancerCity || ''
  form.education = authStore.education || ''
  form.skills = authStore.skills || ''
  form.experience = authStore.experience || ''
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 py-12 px-4" dir="rtl">
    <div class="max-w-2xl mx-auto">
      <div
        class="flex flex-col items-center justify-between gap-5 mb-10 relative sm:flex-row sm:items-end border-b border-slate-900 pb-6"
      >
        <div class="flex flex-col items-center text-center sm:items-start sm:text-right flex-1">
          <div class="relative group mb-4">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileChange"
            />

            <div
              class="flex h-24 w-24 items-center justify-center rounded-full overflow-hidden bg-linear-to-br from-indigo-500 via-purple-500 to-cyan-500 shadow-xl shadow-indigo-500/20 group-hover:scale-102 transition-transform duration-300"
            >
              <img
                v-if="form.avatar"
                :src="form.avatar"
                alt="Profile"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-3xl font-bold text-white">
                {{ avatarLabel }}
              </span>
            </div>

            <button
              @click="triggerFileInput"
              type="button"
              title="انتخاب عکس نمایه"
              class="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 shadow-md cursor-pointer transition-colors duration-200"
            >
              <Camera :size="14" />
            </button>
          </div>

          <h1 class="text-2xl font-bold tracking-tight text-white">تنظیمات حساب کاربری</h1>
          <p class="text-xs text-slate-400 mt-1.5">
            اطلاعات هویتی و راه‌های ارتباطی خود را به‌روزرسانی کنید
          </p>
        </div>

        <button
          @click="router.push('/dashboard')"
          type="button"
          class="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-98 transition-all duration-200 cursor-pointer w-full sm:w-auto justify-center group"
        >
          <span>بازگشت به پنل کاربری</span>
          <ArrowLeft
            :size="14"
            class="text-indigo-200 transition-transform group-hover:-translate-x-0.5"
          />
        </button>
      </div>

      <div
        class="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 md:p-8 shadow-2xl backdrop-blur-xl"
      >
        <div class="space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-400 block mr-1"
              >نام و نام خانوادگی</label
            >
            <div class="relative flex items-center">
              <User :size="18" class="absolute right-4 text-slate-500" />
              <input
                v-model="form.name"
                type="text"
                placeholder="نام خود را وارد کنید"
                class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-400 block mr-1">شماره تلفن همراه</label>
            <div class="relative flex items-center">
              <Phone :size="18" class="absolute right-4 text-slate-500" />
              <input
                v-model="form.phone"
                type="tel"
                placeholder="مثال: 09123456789"
                class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner tabular-nums"
                dir="ltr"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-400 block mr-1">آدرس ایمیل</label>
            <div class="relative flex items-center">
              <Mail :size="18" class="absolute right-4 text-slate-500" />
              <input
                v-model="form.email"
                type="email"
                placeholder="user@example.com"
                class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
                dir="ltr"
              />
            </div>
          </div>

          <div v-if="isEmployee" class="space-y-6 pt-4 border-t border-slate-800/40">
            <div class="space-y-2">
              <label class="text-xs font-semibold text-slate-400 block mr-1">استان</label>
              <div class="relative flex items-center">
                <MapPin :size="18" class="absolute right-4 text-slate-500" />
                <input
                  v-model="form.province"
                  type="text"
                  placeholder="استان خود را وارد کنید"
                  class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-slate-400 block mr-1">شهر</label>
              <div class="relative flex items-center">
                <MapPin :size="18" class="absolute right-4 text-slate-500" />
                <input
                  v-model="form.city"
                  type="text"
                  placeholder="شهر خود را وارد کنید"
                  class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-slate-400 block mr-1"
                >نام شرکت / سازمان</label
              >
              <div class="relative flex items-center">
                <Building2 :size="18" class="absolute right-4 text-slate-500" />
                <input
                  v-model="form.company"
                  type="text"
                  placeholder="نام شرکت یا سازمان خود را وارد کنید"
                  class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
                />
              </div>
            </div>
          </div>

          <div v-else class="space-y-6 pt-4 border-t border-slate-800/40">
            <div class="space-y-2">
              <label class="text-xs font-semibold text-slate-400 block mr-1">تاریخ تولد</label>
              <div class="relative flex items-center">
                <Calendar :size="18" class="absolute right-4 text-slate-500" />
                <input
                  v-model="form.birthDate"
                  type="text"
                  placeholder="مثال: ۱۳۷۸/۰۶/۱5"
                  class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-slate-400 block mr-1">محل تولد</label>
              <div class="relative flex items-center">
                <MapPin :size="18" class="absolute right-4 text-slate-500" />
                <input
                  v-model="form.birthPlace"
                  type="text"
                  placeholder="شهر یا استان محل تولد"
                  class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-slate-400 block mr-1">استان محل سکونت</label>
              <div class="relative flex items-center">
                <MapPin :size="18" class="absolute right-4 text-slate-500" />
                <input
                  v-model="form.freelancerProvince"
                  type="text"
                  placeholder="استان فعلی خود را وارد کنید"
                  class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-slate-400 block mr-1">شهر محل سکونت</label>
              <div class="relative flex items-center">
                <MapPin :size="18" class="absolute right-4 text-slate-500" />
                <input
                  v-model="form.freelancerCity"
                  type="text"
                  placeholder="شهر فعلی خود را وارد کنید"
                  class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-slate-400 block mr-1">مدارک تحصیلی</label>
              <div class="relative flex items-center">
                <GraduationCap :size="18" class="absolute right-4 text-slate-500" />
                <input
                  v-model="form.education"
                  type="text"
                  placeholder="مثال: کارشناسی مهندسی نرم‌افزار"
                  class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-slate-400 block mr-1">تخصص‌ها</label>
              <div class="relative flex items-center">
                <Wrench :size="18" class="absolute right-4 text-slate-500" />
                <input
                  v-model="form.skills"
                  type="text"
                  placeholder="مثال: Vue.js, Tailwind, TypeScript"
                  class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-slate-400 block mr-1">
                سوابق کاری <span class="text-slate-600 text-[10px]">(اختیاری)</span>
              </label>
              <div class="relative flex items-center">
                <Briefcase :size="18" class="absolute right-4 text-slate-500" />
                <input
                  v-model="form.experience"
                  type="text"
                  placeholder="خلاصه‌ای از سوابق کاری خود بنویسید"
                  class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 py-3.5 pr-12 pl-4 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all duration-200 shadow-inner"
                />
              </div>
            </div>
          </div>

          <div class="border-t border-slate-800/60 my-2"></div>

          <div class="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              @click="resetForm"
              type="button"
              class="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 cursor-pointer"
            >
              <RotateCcw :size="14" />
              <span>انصراف و بازنشانی</span>
            </button>

            <button
              @click="saveProfile"
              type="button"
              :disabled="!isFormValid"
              class="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save :size="14" />
              <span>ذخیره تغییرات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
