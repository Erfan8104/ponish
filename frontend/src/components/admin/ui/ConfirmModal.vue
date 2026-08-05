<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    loading?: boolean
    variant?: 'primary' | 'danger' | 'warning'
  }>(),
  {
    title: 'تأیید',
    message: 'آیا از انجام این عملیات مطمئن هستید؟',
    confirmText: 'تأیید',
    cancelText: 'انصراف',
    loading: false,
    variant: 'primary',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function onConfirm() {
  emit('confirm')
}

const variantClass: Record<string, string> = {
  primary: 'bg-[#008f55] hover:bg-[#007a48] text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
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
        <!-- پس‌زمینه -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]" @click="close" />

        <!-- جعبه مودال -->
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
          <!-- آیکون -->
          <div
            class="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-xl"
            :class="{
              'bg-emerald-50 text-emerald-600': variant === 'primary',
              'bg-red-50 text-red-500': variant === 'danger',
              'bg-amber-50 text-amber-600': variant === 'warning',
            }"
          >
            <slot name="icon">
              <span v-if="variant === 'danger'">⚠</span>
              <span v-else-if="variant === 'warning'">!</span>
              <span v-else>?</span>
            </slot>
          </div>

          <h3 class="text-base font-bold text-gray-900 mb-2">{{ title }}</h3>
          <p class="text-xs text-gray-500 leading-relaxed mb-6">{{ message }}</p>

          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 h-10 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              :disabled="loading"
              @click="close"
            >
              {{ cancelText }}
            </button>

            <button
              type="button"
              class="flex-1 h-10 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
              :class="variantClass[variant]"
              :disabled="loading"
              @click="onConfirm"
            >
              {{ loading ? 'در حال انجام...' : confirmText }}
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
