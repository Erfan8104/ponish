<script setup lang="ts">
import { computed } from 'vue'

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
    selectable?: boolean
    selectedRows?: (string | number)[]
  }>(),
  {
    loading: false,
    emptyText: 'موردی یافت نشد',
    rowKey: 'id',
    selectable: false,
    selectedRows: () => [],
  },
)

const emit = defineEmits<{
  rowClick: [row: Record<string, any>]
  'update:selectedRows': [ids: (string | number)[]]
}>()

const allSelected = computed(
  () =>
    props.rows.length > 0 &&
    props.rows.every((row) => props.selectedRows?.includes(row[props.rowKey])),
)

const someSelected = computed(() => (props.selectedRows?.length || 0) > 0 && !allSelected.value)

function toggleAll() {
  if (allSelected.value) {
    emit('update:selectedRows', [])
  } else {
    emit(
      'update:selectedRows',
      props.rows.map((row) => row[props.rowKey]),
    )
  }
}

function toggleRow(id: string | number) {
  const current = props.selectedRows || []
  if (current.includes(id)) {
    emit(
      'update:selectedRows',
      current.filter((x) => x !== id),
    )
  } else {
    emit('update:selectedRows', [...current, id])
  }
}
</script>

<template>
  <div class="w-full overflow-x-auto rounded-2xl border border-gray-100 bg-white">
    <table class="w-full text-sm border-collapse">
      <!-- هدر -->
      <thead>
        <tr class="bg-gray-50/80 border-b border-gray-100">
          <th v-if="selectable" class="px-4 py-3 w-10">
            <input
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 accent-[#008f55] cursor-pointer"
              :checked="allSelected"
              :indeterminate="someSelected"
              @change="toggleAll"
            />
          </th>
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
          <td :colspan="columns.length + (selectable ? 1 : 0)" class="px-4 py-16 text-center">
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
          <td :colspan="columns.length + (selectable ? 1 : 0)" class="px-4 py-16 text-center">
            <p class="text-xs text-gray-400">{{ emptyText }}</p>
          </td>
        </tr>

        <!-- ردیف‌ها -->
        <tr
          v-else
          v-for="row in rows"
          :key="row[rowKey]"
          class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-default"
          :class="selectable && selectedRows?.includes(row[rowKey]) ? 'bg-emerald-50/40' : ''"
          @click="emit('rowClick', row)"
        >
          <td v-if="selectable" class="px-4 py-3.5" @click.stop>
            <input
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 accent-[#008f55] cursor-pointer"
              :checked="selectedRows?.includes(row[rowKey])"
              @change="toggleRow(row[rowKey])"
            />
          </td>
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
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] ?? '—' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
