<!-- eslint-disable vue/multi-word-component-names -->
<script setup name="ProfilePage" lang="ts">
import { reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  name: authStore.name,
  phone: authStore.phone,
  email: authStore.email || '',
})

const isFormValid = computed(() => {
  return form.name.trim().length > 0 && form.phone.trim().length > 0
})

const saveProfile = () => {
  if (!isFormValid.value) {
    toast.error('لطفا نام و شماره تماس را وارد کنید')
    return
  }

  authStore.updateProfile({
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
  })

  toast.success('اطلاعات پروفایل با موفقیت ذخیره شد')
}

const resetForm = () => {
  form.name = authStore.name
  form.phone = authStore.phone
  form.email = authStore.email || ''
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10">
    <div class="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
      <div class="flex flex-col gap-4 mb-8">
        <h1 class="text-3xl font-bold text-gray-900">ویرایش پروفایل</h1>
        <p class="text-gray-600">اطلاعات حساب کاربری خود را ویرایش کنید و آن را ذخیره کنید.</p>
      </div>

      <div class="grid gap-6">
        <label class="block">
          <span class="text-gray-700">نام و نام خانوادگی</span>
          <input
            v-model="form.name"
            type="text"
            placeholder="نام خود را وارد کنید"
            class="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#008f55] focus:outline-none"
          />
        </label>

        <label class="block">
          <span class="text-gray-700">شماره تلفن</span>
          <input
            v-model="form.phone"
            type="tel"
            placeholder="مثال: 09123456789"
            class="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#008f55] focus:outline-none"
          />
        </label>

        <label class="block">
          <span class="text-gray-700">ایمیل</span>
          <input
            v-model="form.email"
            type="email"
            placeholder="مثال: user@example.com"
            class="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#008f55] focus:outline-none"
          />
        </label>

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            @click="saveProfile"
            class="inline-flex items-center justify-center rounded-xl bg-[#008f55] px-6 py-3 text-white font-semibold hover:bg-[#007244] transition-colors"
          >
            ذخیره تغییرات
          </button>
          <button
            @click="resetForm"
            class="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            بازنشانی
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
