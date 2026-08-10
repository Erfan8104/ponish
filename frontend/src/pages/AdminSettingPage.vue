<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getAllSettingsApi, updateSettingsApi } from '@/services/admin.service'
import AdminCard from '@/components/admin/ui/AdminCard.vue'

const loading = ref(true)
const saving = ref(false)
const settings = ref<any[]>([])
const form = ref<Record<string, string>>({})
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const groupLabels: Record<string, string> = {
  general: 'عمومی',
  financial: 'مالی',
  system: 'سیستم',
}

const grouped = computed(() => {
  const result: Record<string, any[]> = {}
  for (const s of settings.value) {
    const g = s.group || 'general'
    if (!result[g]) result[g] = []
    result[g].push(s)
  }
  return result
})

async function fetchSettings() {
  loading.value = true
  try {
    const data = await getAllSettingsApi()
    if (data?.success) {
      settings.value = data.settings || []
      const map: Record<string, string> = {}
      for (const s of settings.value) {
        map[s.key] = s.value
      }
      form.value = map
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  saving.value = true
  message.value = ''
  try {
    const payload = Object.entries(form.value).map(([key, value]) => ({
      key,
      value: String(value),
    }))
    const res = await updateSettingsApi(payload)
    if (res?.success) {
      message.value = 'تنظیمات با موفقیت ذخیره شد'
      messageType.value = 'success'
      settings.value = res.settings || settings.value
    } else {
      message.value = res?.message || 'خطا در ذخیره'
      messageType.value = 'error'
    }
  } catch (e: any) {
    message.value = e?.response?.data?.message || 'خطا در ذخیره تنظیمات'
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-gray-800" style="direction: rtl">
    <div class="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">تنظیمات سایت</h1>
        <p class="text-xs text-gray-400 mt-1">مدیریت تنظیمات عمومی، مالی و سیستم</p>
      </div>

      <div
        v-if="message"
        class="px-4 py-3 rounded-lg text-sm"
        :class="messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
      >
        {{ message }}
      </div>

      <div v-if="loading" class="text-center py-12 text-gray-400">در حال بارگذاری...</div>

      <template v-else>
        <div
          v-for="(items, group) in grouped"
          :key="group"
          class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div class="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            <h2 class="text-sm font-semibold text-gray-700">
              {{ groupLabels[group] || group }}
            </h2>
          </div>

          <div class="p-5 space-y-4">
            <div v-for="s in items" :key="s.key" class="space-y-1.5">
              <label class="block text-xs font-medium text-gray-600">
                {{ s.label || s.key }}
              </label>

              <!-- boolean -->
              <div v-if="s.type === 'boolean'" class="flex items-center gap-3">
                <button
                  type="button"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="form[s.key] === 'true' ? 'bg-emerald-500' : 'bg-gray-200'"
                  @click="form[s.key] = form[s.key] === 'true' ? 'false' : 'true'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow"
                    :class="form[s.key] === 'true' ? '-translate-x-6' : '-translate-x-1'"
                  />
                </button>
                <span class="text-xs text-gray-500">
                  {{ form[s.key] === 'true' ? 'فعال' : 'غیرفعال' }}
                </span>
              </div>

              <!-- number -->
              <input
                v-else-if="s.type === 'number'"
                v-model="form[s.key]"
                type="number"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />

              <!-- text / email / phone -->
              <input
                v-else
                v-model="form[s.key]"
                :type="s.type === 'email' ? 'email' : 'text'"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <!-- هشدار حالت تعمیر -->
        <div
          v-if="form.maintenance_mode === 'true'"
          class="px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm"
        >
          ⚠️ حالت تعمیر و نگهداری فعال است. سایت برای کاربران عادی در دسترس نخواهد بود.
        </div>

        <div class="flex justify-end">
          <button
            class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
            :disabled="saving"
            @click="saveSettings"
          >
            {{ saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
