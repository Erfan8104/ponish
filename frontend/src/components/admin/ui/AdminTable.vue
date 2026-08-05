<script setup lang="ts">
export interface TableColumn {
  key: string
  label: string
  width?: string
  align?: 'right' | 'left' | 'center'
  sortable?: boolean
}

const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    rows: Record<string, any>[]
    loading?: boolean
    emptyText?: string
    rowKey?: string
  }>(),
  {
    loading: false,
    emptyText: 'موردی یافت نشد',
    rowKey: 'id',
  },
)

const emit = defineEmits<{
  rowClick: [row: Record<string, any>]
}>()
</script>

<template>
  <div class="w-full overflow-x-auto rounded-2xl border border-gray-100 bg-white">
    <table class="w-full text-sm border-collapse">
      <!-- هدر -->
      <thead>
        <tr class="bg-gray-50/80 border-b border-gray-100">
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-[11px] font-semibold text-gray-400 whitespace-nowrap"
            :class="{
              'text-right': !col.align || col.align === 'right',
              'text-left': col.align === 'left',
              'text-center': col.align === 'center',
            }"
            :style="col.width ? { width: col.width } : undefined"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>

      <!-- بدنه -->
      <tbody>
        <!-- حالت لودینگ -->
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-4 py-16 text-center">
            <div class="flex flex-col items-center gap-2 text-gray-400">
              <div
                class="w-6 h-6 border-2 border-gray-200 border-t-[#008f55] rounded-full animate-spin"
              />
              <span class="text-xs">در حال بارگذاری...</span>
            </div>
          </td>
        </tr>

        <!-- حالت خالی -->
        <tr v-else-if="!rows.length">
          <td :colspan="columns.length" class="px-4 py-16 text-center">
            <p class="text-xs text-gray-400">{{ emptyText }}</p>
          </td>
        </tr>

        <!-- ردیف‌ها -->
        <tr
          v-else
          v-for="row in rows"
          :key="row[rowKey]"
          class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-default"
          @click="emit('rowClick', row)"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3.5 text-gray-700"
            :class="{
              'text-right': !col.align || col.align === 'right',
              'text-left': col.align === 'left',
              'text-center': col.align === 'center',
            }"
          >
            <!-- اسلات سفارشی برای هر ستون: #cell-status ، #cell-name و ... -->
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] ?? '—' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
