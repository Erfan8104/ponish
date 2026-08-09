<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode: 'create' | 'edit'
    initial?: { id?: number; name?: string; slug?: string }
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
  submit: [payload: { name: string; slug: string }]
  cancel: []
}>()

const name = ref('')
const slug = ref('')
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
    name.value = props.initial?.name || ''
    slug.value = props.initial?.slug || ''
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

const isValid = computed(() => name.value.trim().length > 0 && slug.value.trim().length > 0)

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function onSubmit() {
  if (!isValid.value) return
  emit('submit', { name: name.value.trim(), slug: slug.value.trim() })
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

        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
          <h3 class="text-base font-bold text-gray-900 mb-5">
            {{ mode === 'create' ? 'مهارت جدید' : 'ویرایش مهارت' }}
          </h3>

          <div class="space-y-4">
            <div>
              <label class="text-[11px] font-medium text-gray-400 mb-1 block">نام</label>
              <input
                v-model="name"
                type="text"
                placeholder="مثلاً AutoCAD"
                class="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
              />
            </div>

            <div>
              <label class="text-[11px] font-medium text-gray-400 mb-1 block">اسلاگ</label>
              <input
                v-model="slug"
                type="text"
                placeholder="autocad"
                style="direction: ltr; text-align: right"
                class="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:border-[#008f55] focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
                @input="onSlugInput"
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
