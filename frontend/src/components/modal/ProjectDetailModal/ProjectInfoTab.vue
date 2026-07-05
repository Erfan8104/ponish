<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/project.store'

const store = useProjectStore()

const project = computed(() => store.projectDetails)
</script>

<template>
  <div v-if="project" class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <!-- Basic Info -->
    <div class="space-y-4 rounded-xl border p-4">
      <h3 class="font-semibold text-gray-800">اطلاعات اصلی</h3>

      <div>
        <p class="text-sm text-gray-500">عنوان</p>
        <p class="font-medium">{{ project.title }}</p>
      </div>

      <div>
        <p class="text-sm text-gray-500">توضیحات</p>
        <p class="text-sm">{{ project.description }}</p>
      </div>

      <div>
        <p class="text-sm text-gray-500">وضعیت</p>
        <span class="rounded bg-emerald-100 px-2 py-1 text-xs">
          {{ project.status }}
        </span>
      </div>
    </div>

    <!-- Location -->
    <div class="space-y-4 rounded-xl border p-4">
      <h3 class="font-semibold text-gray-800">موقعیت</h3>

      <div>
        <p class="text-sm text-gray-500">استان / شهر</p>
        <p>{{ project.province }} - {{ project.city }}</p>
      </div>

      <div>
        <p class="text-sm text-gray-500">آدرس</p>
        <p>{{ project.address || '-' }}</p>
      </div>
    </div>

    <!-- Technical -->
    <div class="space-y-4 rounded-xl border p-4 md:col-span-2">
      <h3 class="font-semibold text-gray-800">مشخصات فنی</h3>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-500">مساحت</p>
          <p>{{ project.calculatedArea }} m²</p>
        </div>

        <div>
          <p class="text-sm text-gray-500">سیستم مختصات</p>
          <p>{{ project.coordinateSystem }}</p>
        </div>

        <div>
          <p class="text-sm text-gray-500">دقت مورد نیاز</p>
          <p>{{ project.requiredAccuracy }}</p>
        </div>

        <div>
          <p class="text-sm text-gray-500">زمان تحویل</p>
          <p>{{ project.deliveryTime }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
