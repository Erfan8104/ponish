<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface MergeCandidate {
  id: number
  name: string
  freelancersCount: number
  projectsCount: number
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    skills: MergeCandidate[]
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
  submit: [payload: { sourceSkillIds: number[]; targetSkillId: number }]
  cancel: []
}>()

const targetId = ref<number | null>(null)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      // پیش‌فرض: مهارتی که بیشترین استفاده را دارد به‌عنوان مقصد پیشنهاد می‌شود
      const sorted = [...props.skills].sort(
        (a, b) => b.freelancersCount + b.projectsCount - (a.freelancersCount + a.projectsCount),
      )
      targetId.value = sorted[0]?.id ?? null
    }
  },
)

const sourceIds = computed(() =>
  props.skills.filter((s) => s.id !== targetId.value).map((s) => s.id),
)

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function onSubmit() {
  if (!targetId.value) return
  emit('submit', {
    sourceSkillIds: sourceIds.value,
    targetSkillId: targetId.value,
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
          <h3 class="text-base font-bold text-gray-900 mb-1">ادغام مهارت‌ها</h3>
          <p class="text-xs text-gray-400 mb-5">
            یکی از مهارت‌های زیر را به‌عنوان مقصد نهایی انتخاب کنید؛ بقیه حذف شده و تمام
            فریلنسرها/پروژه‌های مرتبط به مهارت مقصد منتقل می‌شوند.
          </p>

          <div class="space-y-2 max-h-64 overflow-y-auto">
            <label
              v-for="skill in skills"
              :key="skill.id"
              class="flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
              :class="
                targetId === skill.id
                  ? 'border-[#008f55] bg-emerald-50'
                  : 'border-gray-200 hover:bg-gray-50'
              "
            >
              <div class="flex items-center gap-2.5">
                <input
                  type="radio"
                  :value="skill.id"
                  v-model="targetId"
                  class="accent-[#008f55] w-4 h-4"
                />
                <span class="text-sm font-medium text-gray-700">{{ skill.name }}</span>
              </div>
              <span class="text-[11px] text-gray-400">
                {{ skill.freelancersCount }} فریلنسر · {{ skill.projectsCount }} پروژه
              </span>
            </label>
          </div>

          <p v-if="errorMessage" class="text-xs text-red-500 mt-3">{{ errorMessage }}</p>

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
              :disabled="loading || !targetId"
              @click="onSubmit"
            >
              {{ loading ? 'در حال ادغام...' : 'ادغام کن' }}
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
