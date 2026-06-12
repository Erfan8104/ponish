<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '../../stores/project.store'

const store = useProjectStore()
const skillsDatabase = [
  'الگوریتم',
  'امنیت وب',
  'ام‌کیو‌ال۴ (MQL4)',
  'آنگولار (Angular.js)',
  'انیمیشن',
  'ایلوستریتور (Adobe Illustrator)',
  'طراحی کاراکتر',
  'رسم',
  'عکاسی',
  'نقاشی دیجیتال',
]
const isSkillsDropdownOpen = ref(false)
const skillSearchQuery = ref('')

const filteredSkills = computed(() => {
  const available = skillsDatabase.filter((s) => !store.formData.skills.includes(s))
  if (!skillSearchQuery.value.trim()) return available
  return available.filter((s) => s.toLowerCase().includes(skillSearchQuery.value.toLowerCase()))
})

const selectSkill = (skill: string) => {
  store.formData.skills.push(skill)
  skillSearchQuery.value = ''
}

const removeSkill = (skillToRemove: string) => {
  store.formData.skills = store.formData.skills.filter((s) => s !== skillToRemove)
}
</script>

<template>
  <div class="relative text-right" style="direction: rtl">
    <input
      v-model="skillSearchQuery"
      type="text"
      placeholder="جستجوی مهارت‌ها..."
      class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#008f55] outline-none"
      @focus="isSkillsDropdownOpen = true"
    />
    <div
      v-if="isSkillsDropdownOpen && filteredSkills.length > 0"
      class="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto"
    >
      <div
        v-for="skill in filteredSkills"
        :key="skill"
        @click="selectSkill(skill)"
        class="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
      >
        {{ skill }}
      </div>
    </div>
    <div v-if="store.formData.skills.length > 0" class="mt-4 flex flex-wrap gap-2">
      <div
        v-for="skill in store.formData.skills"
        :key="skill"
        class="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg pl-2 pr-3 py-1.5 text-xs text-gray-600"
      >
        <span>{{ skill }}</span>
        <button type="button" @click="removeSkill(skill)" class="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>
    </div>
  </div>
</template>
