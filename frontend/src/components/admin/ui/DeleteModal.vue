<script setup lang="ts">
import ConfirmModal from './ConfirmModal.vue'

withDefaults(
  defineProps<{
    modelValue: boolean
    itemName?: string
    loading?: boolean
  }>(),
  {
    itemName: 'این مورد',
    loading: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()
</script>

<template>
  <ConfirmModal
    :model-value="modelValue"
    title="حذف"
    :message="`آیا از حذف «${itemName}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`"
    confirm-text="حذف"
    cancel-text="انصراف"
    variant="danger"
    :loading="loading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="emit('confirm')"
  >
    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"
        />
      </svg>
    </template>
  </ConfirmModal>
</template>
