<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useRoleStore } from '@/stores/role.store'
import { useProjectStore } from '@/stores/project.store'

import ProfileCard from '@/components/dashboard/ProfileCard.vue'
import ProjectList from '@/components/dashboard/ProjectList.vue'
import UserEmployerProject from '@/components/dashboard/UserEmployerProject.vue'
import ActiveFreelancerProject from '@/components/dashboard/ActiveFreelancerProject.vue'

import ProposalModal from '@/components/modal/ProposalModal.vue'
import ProjectDetailModal from '@/components/modal/ProjectDetailModal.vue'

const roleStore = useRoleStore()
const projectStore = useProjectStore()

const isEmployer = computed(() => roleStore.role === 'employer')

const isFreelancer = computed(() => roleStore.role === 'freelancer')

onMounted(async () => {
  const requests = []

  if (isEmployer.value) {
    requests.push(projectStore.fetchMyProjects())
  }

  if (isFreelancer.value) {
    requests.push(projectStore.fetchAcceptedProjects())
  }

  await Promise.all(requests)
})
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <!-- پروفایل -->
      <section class="mb-10">
        <ProfileCard />
      </section>

      <!-- ================= Employer ================= -->
      <section v-if="isEmployer" class="mb-12">
        <div class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <!-- Header -->
          <div
            class="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 class="text-2xl font-bold">پروژه‌های من</h2>

              <p class="mt-1 text-sm text-emerald-100">
                در این بخش می‌توانید پروژه‌هایی را که ایجاد کرده‌اید مشاهده و مدیریت کنید.
              </p>
            </div>

            <div
              class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur-sm"
            >
              {{ projectStore.myProjects.length }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <UserEmployerProject />
          </div>
        </div>
      </section>

      <!-- ================= Freelancer ================= -->
      <section v-if="isFreelancer" class="mb-12">
        <div class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <!-- Header -->
          <div
            class="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 class="text-2xl font-bold">پروژه‌های پذیرفته شده توسط کارفرما</h2>

              <p class="mt-1 text-sm text-blue-100">
                پروژه‌هایی که پیشنهاد شما توسط کارفرما پذیرفته شده است.
              </p>
            </div>

            <div
              class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur-sm"
            >
              {{ projectStore.acceptedProjects.length }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <ActiveFreelancerProject />
          </div>
        </div>
      </section>

      <!-- ================= Public Projects ================= -->
      <section v-if="!isEmployer" class="mb-12">
        <ProjectList />
      </section>
    </div>

    <!-- Modals -->
    <ProposalModal />
    <ProjectDetailModal />
  </main>
</template>
