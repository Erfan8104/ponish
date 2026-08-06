<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getUserDetailApi,
  toggleUserStatusApi,
  verifyUserApi,
  deleteUserApi,
  resetUserPasswordApi,
  changeUserRoleApi,
} from '@/services/admin.service'
import AdminCard from '@/components/admin/ui/AdminCard.vue'
import StatusBadge from '@/components/admin/ui/StatusBadge.vue'
import ConfirmModal from '@/components/admin/ui/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const userId = Number(route.params.id)

const loading = ref(true)
const user = ref<any>(null)
const payments = ref<any[]>([])
const messages = ref<any[]>([])
const activeTab = ref('profile')

const tabs = [
  { key: 'profile', label: 'پروفایل' },
  { key: 'employer', label: 'پروفایل کارفرما' },
  { key: 'freelancer', label: 'پروفایل فریلنسر' },
  { key: 'projects', label: 'پروژه‌ها' },
  { key: 'contracts', label: 'قراردادها' },
  { key: 'reviews', label: 'نظرات' },
  { key: 'messages', label: 'پیام‌ها' },
  { key: 'payments', label: 'پرداخت‌ها' },
]

const roleLabel: Record<string, string> = {
  employer: 'کارفرما',
  freelancer: 'فریلنسر',
  both: 'هردو',
  admin: 'ادمین',
}

async function fetchDetail() {
  loading.value = true
  try {
    const data = await getUserDetailApi(userId)
    if (data?.success) {
      user.value = data.user
      payments.value = data.payments || []
      messages.value = data.messages || []
    }
  } finally {
    loading.value = false
  }
}
onMounted(fetchDetail)

async function toggleStatus() {
  const res = await toggleUserStatusApi(userId)
  if (res?.success) user.value.isActive = res.user.isActive
}

async function verify() {
  const res = await verifyUserApi(userId)
  if (res?.success) user.value.isVerified = true
}

const showDeleteModal = ref(false)
async function confirmDelete() {
  const res = await deleteUserApi(userId)
  if (res?.success) router.push('/admin/users')
}

const newPassword = ref('')
async function resetPassword() {
  const res = await resetUserPasswordApi(userId)
  if (res?.success) newPassword.value = res.newPassword
}

const showRoleModal = ref(false)
const selectedRole = ref('')
async function changeRole() {
  const res = await changeUserRoleApi(userId, selectedRole.value)
  if (res?.success) {
    user.value.role = res.user.role
    showRoleModal.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div v-if="loading" class="flex justify-center py-24">
      <div class="w-8 h-8 border-2 border-gray-200 border-t-[#008f55] rounded-full animate-spin" />
    </div>

    <div v-else-if="user" class="max-w-6xl mx-auto space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-400"
          >
            {{ (user.name || user.phone || '؟').charAt(0) }}
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">{{ user.name || 'بدون نام' }}</h1>
            <p class="text-xs text-gray-400">
              {{ user.phone }} · {{ roleLabel[user.role] || user.role }}
            </p>
          </div>
          <StatusBadge :status="user.isActive ? 'active' : 'inactive'" />
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            class="px-3 py-1.5 rounded-lg text-[11px] font-medium"
            :class="
              user.isActive
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            "
            @click="toggleStatus"
          >
            {{ user.isActive ? 'غیرفعال کردن' : 'فعال‌سازی' }}
          </button>
          <button
            v-if="!user.isVerified"
            class="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100"
            @click="verify"
          >
            تایید هویت
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-amber-50 text-amber-600 hover:bg-amber-100"
            @click="resetPassword"
          >
            بازنشانی رمز عبور
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
            @click="showRoleModal = true"
          >
            تغییر نقش
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-red-600 text-white hover:bg-red-700"
            @click="showDeleteModal = true"
          >
            حذف کاربر
          </button>
        </div>
      </div>

      <div
        v-if="newPassword"
        class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700"
      >
        رمز عبور جدید: <span class="font-bold font-mono">{{ newPassword }}</span>
        — این رمز فقط یک‌بار نمایش داده می‌شود.
      </div>

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

      <AdminCard v-if="activeTab === 'profile'" title="اطلاعات پروفایل">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div><span class="text-gray-400">نام:</span> {{ user.name || '—' }}</div>
          <div><span class="text-gray-400">شماره:</span> {{ user.phone }}</div>
          <div><span class="text-gray-400">ایمیل:</span> {{ user.email || '—' }}</div>
          <div>
            <span class="text-gray-400">استان/شهر:</span>
            {{ [user.province, user.city].filter(Boolean).join('، ') || '—' }}
          </div>
          <div><span class="text-gray-400">بیوگرافی:</span> {{ user.bio || '—' }}</div>
          <div>
            <span class="text-gray-400">تاریخ عضویت:</span>
            {{ new Date(user.createdAt).toLocaleDateString('fa-IR') }}
          </div>
        </div>
      </AdminCard>

      <AdminCard v-else-if="activeTab === 'employer'" title="پروفایل کارفرما">
        <div v-if="user.employerProfile" class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span class="text-gray-400">نام شرکت:</span>
            {{ user.employerProfile.companyName || '—' }}
          </div>
          <div>
            <span class="text-gray-400">نوع شرکت:</span>
            {{ user.employerProfile.companyType || '—' }}
          </div>
          <div>
            <span class="text-gray-400">وبسایت:</span> {{ user.employerProfile.website || '—' }}
          </div>
          <div>
            <span class="text-gray-400">آدرس:</span> {{ user.employerProfile.address || '—' }}
          </div>
        </div>
        <p v-else class="text-xs text-gray-400">این کاربر پروفایل کارفرما ندارد.</p>
      </AdminCard>

      <AdminCard v-else-if="activeTab === 'freelancer'" title="پروفایل فریلنسر">
        <div v-if="user.freelancerProfile" class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span class="text-gray-400">تحصیلات:</span>
            {{ user.freelancerProfile.education || '—' }}
          </div>
          <div>
            <span class="text-gray-400">سابقه:</span> {{ user.freelancerProfile.experience || '—' }}
          </div>
          <div>
            <span class="text-gray-400">نرخ ساعتی:</span>
            {{ user.freelancerProfile.hourlyRate || '—' }}
          </div>
          <div>
            <span class="text-gray-400">امتیاز:</span> {{ user.freelancerProfile.rating }} ({{
              user.freelancerProfile.completedJobs
            }}
            پروژه تکمیل‌شده)
          </div>
          <div class="sm:col-span-2">
            <span class="text-gray-400">مهارت‌ها:</span>
            {{ user.freelancerProfile.skills?.map((s: any) => s.skill.name).join('، ') || '—' }}
          </div>
        </div>
        <p v-else class="text-xs text-gray-400">این کاربر پروفایل فریلنسر ندارد.</p>
      </AdminCard>

      <AdminCard v-else-if="activeTab === 'projects'" title="پروژه‌ها">
        <div v-if="user.projects?.length" class="divide-y divide-gray-100">
          <div v-for="p in user.projects" :key="p.id" class="py-2.5 flex justify-between text-xs">
            <span>{{ p.title || 'بدون عنوان' }}</span>
            <StatusBadge :status="p.status" />
          </div>
        </div>
        <p v-else class="text-xs text-gray-400">پروژه‌ای ثبت نشده.</p>
      </AdminCard>

      <AdminCard v-else-if="activeTab === 'contracts'" title="قراردادها">
        <div
          v-if="user.contractsAsEmployer?.length || user.contractsAsFreelancer?.length"
          class="divide-y divide-gray-100"
        >
          <div
            v-for="c in [...user.contractsAsEmployer, ...user.contractsAsFreelancer]"
            :key="c.id"
            class="py-2.5 flex justify-between text-xs"
          >
            <span>{{ c.freelancer?.name || c.employer?.name || '—' }}</span>
            <span>{{ Number(c.totalAmount).toLocaleString('fa-IR') }} تومان</span>
            <StatusBadge :status="c.status" />
          </div>
        </div>
        <p v-else class="text-xs text-gray-400">قراردادی ثبت نشده.</p>
      </AdminCard>

      <AdminCard v-else-if="activeTab === 'reviews'" title="نظرات">
        <div v-if="user.reviewsReceived?.length" class="space-y-3">
          <div
            v-for="r in user.reviewsReceived"
            :key="r.id"
            class="text-xs p-3 bg-gray-50 rounded-xl"
          >
            <span class="font-semibold">امتیاز: {{ r.rating }}/5</span>
            <p class="text-gray-500 mt-1">{{ r.comment || '—' }}</p>
          </div>
        </div>
        <p v-else class="text-xs text-gray-400">نظری ثبت نشده.</p>
      </AdminCard>

      <AdminCard v-else-if="activeTab === 'messages'" title="آخرین پیام‌ها">
        <div v-if="messages.length" class="divide-y divide-gray-100">
          <div v-for="m in messages" :key="m.id" class="py-2.5 text-xs">
            <p>{{ m.content || '[فایل]' }}</p>
            <span class="text-gray-400 text-[10px]">{{
              new Date(m.createdAt).toLocaleString('fa-IR')
            }}</span>
          </div>
        </div>
        <p v-else class="text-xs text-gray-400">پیامی یافت نشد.</p>
      </AdminCard>

      <AdminCard v-else-if="activeTab === 'payments'" title="پرداخت‌ها">
        <div v-if="payments.length" class="divide-y divide-gray-100">
          <div v-for="p in payments" :key="p.id" class="py-2.5 flex justify-between text-xs">
            <span>{{ Number(p.amount).toLocaleString('fa-IR') }} تومان</span>
            <StatusBadge :status="p.status" />
          </div>
        </div>
        <p v-else class="text-xs text-gray-400">پرداختی ثبت نشده.</p>
      </AdminCard>
    </div>

    <ConfirmModal
      v-model="showDeleteModal"
      title="حذف کاربر"
      message="آیا از حذف این کاربر مطمئن هستید؟ این عمل قابل بازگشت نیست."
      confirm-text="حذف کن"
      variant="danger"
      @confirm="confirmDelete"
    />

    <div
      v-if="showRoleModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="showRoleModal = false"
    >
      <div class="bg-white rounded-2xl p-6 w-80 space-y-4" style="direction: rtl">
        <h3 class="text-sm font-bold">تغییر نقش کاربر</h3>
        <select
          v-model="selectedRole"
          class="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm"
        >
          <option value="">انتخاب کنید</option>
          <option value="employer">کارفرما</option>
          <option value="freelancer">فریلنسر</option>
          <option value="both">هردو</option>
          <option value="admin">ادمین</option>
        </select>
        <div class="flex gap-2 justify-end">
          <button class="px-4 py-2 text-xs text-gray-500" @click="showRoleModal = false">
            انصراف
          </button>
          <button
            class="px-4 py-2 text-xs bg-[#008f55] text-white rounded-lg disabled:opacity-40"
            :disabled="!selectedRole"
            @click="changeRole"
          >
            تایید
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
