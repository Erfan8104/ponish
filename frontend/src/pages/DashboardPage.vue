<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoleStore } from '@/stores/role.store'
import { useProjectStore } from '@/stores/project.store'

import ProfileCard from '@/components/dashboard/ProfileCard.vue'
import ProjectList from '@/components/dashboard/ProjectList.vue'
import ProposalModal from '@/components/modal/ProposalModal.vue'
import UserEmployerProject from '@/components/dashboard/UserEmployerProject.vue'

const roleStore = useRoleStore()
const storeProject = useProjectStore()

const isEmployer = computed(() => roleStore.role === 'employer')

// ✅ اینجا مهم‌ترین اصلاح
onMounted(async () => {
  await storeProject.fetchMyProjects()
})
</script>
<template>
  <main class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <!-- Profile -->
      <section class="mb-10">
        <ProfileCard />
      </section>

      <section v-if="isEmployer" class="mb-12">
        <div class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <!-- Header -->
          <div
            class="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 class="text-2xl font-bold">پروژه‌های من</h2>

              <p class="mt-1 text-sm text-emerald-100">
                در این بخش می‌توانید تمام پروژه‌هایی را که ایجاد کرده‌اید مشاهده و مدیریت کنید.
              </p>
            </div>

            <div
              class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur-sm"
            >
              {{ storeProject.myProjects.length }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <UserEmployerProject />
          </div>
        </div>
      </section>

      <!-- Projects - فقط برای Employer نمایش داده شود -->
      <section v-if="!isEmployer" class="mb-12">
        <ProjectList />
      </section>
    </div>
    <ProposalModal />
  </main>
</template>
