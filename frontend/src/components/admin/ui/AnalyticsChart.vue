<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Legend,
  Filler,
)

const props = withDefaults(
  defineProps<{
    title: string
    data: { date: string; label: string; value: number }[]
    color?: string
    type?: 'bar' | 'line'
    formatValue?: (n: number) => string
  }>(),
  {
    color: '#008f55',
    type: 'bar',
  },
)

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function formatDefault(n: number) {
  return n.toLocaleString('fa-IR')
}

const formatter = computed(() => props.formatValue || formatDefault)
const total = computed(() => props.data.reduce((sum, d) => sum + d.value, 0))

function buildChart() {
  if (!canvasRef.value || !props.data.length) return

  const labels = props.data.map((d) => d.label)
  const values = props.data.map((d) => d.value)

  const dataset = {
    label: props.title,
    data: values,
    backgroundColor:
      props.type === 'line' ? hexToRgba(props.color, 0.12) : hexToRgba(props.color, 0.85),
    borderColor: props.color,
    borderWidth: props.type === 'line' ? 2 : 0,
    borderRadius: props.type === 'bar' ? 6 : 0,
    fill: props.type === 'line',
    tension: 0.35,
    pointRadius: props.type === 'line' ? 2 : 0,
    pointHoverRadius: 4,
    maxBarThickness: 40,
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => formatter.value(ctx.parsed.y ?? ctx.parsed),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#9ca3af', maxRotation: 0 },
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: {
          font: { size: 10 },
          color: '#9ca3af',
          callback: (value: any) => formatter.value(Number(value)),
        },
      },
    },
  }

  if (chartInstance) {
    ;(chartInstance.config as any).type = props.type
    chartInstance.data.labels = labels
    chartInstance.data.datasets = [dataset]
    chartInstance.options = options
    chartInstance.update()
  } else {
    chartInstance = new Chart(canvasRef.value, {
      type: props.type,
      data: { labels, datasets: [dataset] },
      options,
    })
  }
}

onMounted(buildChart)

watch(
  () => [props.data, props.type, props.color],
  () => buildChart(),
  { deep: true },
)

onBeforeUnmount(() => {
  chartInstance?.destroy()
  chartInstance = null
})
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-2xl p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-gray-900">{{ title }}</h3>
      <span class="text-xs text-gray-400">جمع: {{ formatter(total) }}</span>
    </div>

    <div class="relative h-56">
      <canvas v-show="data.length" ref="canvasRef" />
      <div
        v-if="!data.length"
        class="absolute inset-0 flex items-center justify-center text-xs text-gray-400"
      >
        داده‌ای برای این بازه یافت نشد
      </div>
    </div>
  </div>
</template>
