<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface CategoryOption {
  id: number
  name: string
  parentId: number | null
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode: 'create' | 'edit'
    initial?: {
      id?: number
      name?: string
      slug?: string
      description?: string | null
      parentId?: number | null
    }
    categories: CategoryOption[]
    loading?: boolean
    errorMessage?: string | null
  }>(),
  {
    loading: false,
    errorMessage: null,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [
    payload: {
      name: string
      slug: string
      description: string
      parentId: number | null
    },
  ]
  cancel: []
}>()

const name = ref('')
const slug = ref('')
const description = ref('')
const parentId = ref<number | null>(null)
const slugTouched = ref(false)

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    // مقداردهی اولیه هر بار که مودال باز می‌شود
    name.value = props.initial?.name || ''
    slug.value = props.initial?.slug || ''
    description.value = props.initial?.description || ''
    parentId.value = props.initial?.parentId ?? null
    slugTouched.value = props.mode === 'edit'
  },
)

watch(name, (val) => {
  if (!slugTouched.value) {
    slug.value = slugify(val)
  }
})

function onSlugInput() {
  slugTouched.value = true
}

// دسته‌های قابل انتخاب به‌عنوان والد: خود دسته و زیرمجموعه‌هایش حذف می‌شوند (جلوگیری از حلقه در UI)
const availableParents = computed(() => {
  if (props.mode === 'create' || !props.initial?.id) {
    return props.categories
  }

  const selfId = props.initial.id
  const excluded = new Set<number>([selfId])

  // چند بار عبور برای پیدا کردن نوادگان (کافی برای عمق‌های معمول)
  let changed = true
  while (changed) {
    changed = false
    for (const cat of props.categories) {
      if (cat.parentId !== null && excluded.has(cat.parentId) && !excluded.has(cat.id)) {
        excluded.add(cat.id)
        changed = true
      }
    }
  }

  return props.categories.filter((c) => !excluded.has(c.id))
})

const isValid = computed(() => name.value.trim().length > 0 && slug.value.trim().length > 0)

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function onSubmit() {
  if (!isValid.value) return
  emit('submit', {
    name: name.value.trim(),
    slug: slug.value.trim(),
    description: description.value.trim(),
    parentId: parentId.value,
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style="direction: rtl"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]" @click="close" />

        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <h3 class="text-base font-bold text-gray-900 mb-5">
            {{ mode === 'create' ? 'دسته‌بندی جدید' : 'ویرایش دسته‌بندی' }}
          </h3>

          <div class="space-y-4">
            <div>
              <label class="text-[11px] font-medium text-gray-400 mb-1 block">نام</label>
              <input
                v-model="name"
                type="text"
                placeholder="مثلاً نقشه‌برداری زمینی"
                class="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
              />
            </div>

            <div>
              <label class="text-[11px] font-medium text-gray-400 mb-1 block">اسلاگ</label>
              <input
                v-model="slug"
                type="text"
                placeholder="mapping"
                style="direction: ltr; text-align: right"
                class="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
                @input="onSlugInput"
              />
            </div>

            <div>
              <label class="text-[11px] font-medium text-gray-400 mb-1 block">
                دسته‌بندی والد (اختیاری)
              </label>
              <select
                v-model="parentId"
                class="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all cursor-pointer"
              >
                <option :value="null">بدون والد (دسته‌ی اصلی)</option>
                <option v-for="cat in availableParents" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="text-[11px] font-medium text-gray-400 mb-1 block">
                توضیحات (اختیاری)
              </label>
              <textarea
                v-model="description"
                rows="3"
                placeholder="توضیح کوتاه درباره این دسته‌بندی"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all resize-none"
              />
            </div>

            <p v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</p>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              type="button"
              class="flex-1 h-10 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              :disabled="loading"
              @click="close"
            >
              انصراف
            </button>

            <button
              type="button"
              class="flex-1 h-10 rounded-xl text-sm font-bold bg-[#008f55] hover:bg-[#007a48] text-white transition-colors disabled:opacity-50"
              :disabled="loading || !isValid"
              @click="onSubmit"
            >
              {{ loading ? 'در حال ذخیره...' : mode === 'create' ? 'ایجاد کن' : 'ذخیره کن' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
