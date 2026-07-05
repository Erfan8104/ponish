<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useProposalStore } from '@/stores/proposal.store'

import {
  X,
  Wallet,
  CalendarDays,
  FileText,
  FolderKanban,
  BadgeDollarSign,
  LoaderCircle,
} from 'lucide-vue-next'

const proposalStore = useProposalStore()

const { isModalOpen, selectedProject, form, isSubmitting, error } = storeToRefs(proposalStore)
const onlyNumber = (event: Event, field: 'amount' | 'deliveryDays') => {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/\D/g, '')

  form.value[field] = value === '' ? null : Number(value)
  input.value = value
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      >
        <Transition
          appear
          enter-active-class="duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            class="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl max-h-[88vh] overflow-hidden"
          >
            <!-- Header -->
            <div
              class="flex items-center justify-between bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-6 py-4 text-white"
            >
              <div>
                <h2 class="text-xl font-extrabold">ارسال پیشنهاد</h2>
                <p class="text-sm text-indigo-100 mt-1">پیشنهاد حرفه‌ای خود را ثبت کنید.</p>
              </div>

              <button
                @click="proposalStore.closeModal"
                class="rounded-xl bg-white/10 p-2 transition hover:bg-white/20 hover:rotate-90"
              >
                <X :size="20" />
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="proposalStore.submit" class="flex flex-col">
              <div class="overflow-y-auto max-h-[calc(88vh-78px)] space-y-6 p-6">
                <!-- Project Info -->
                <div
                  v-if="selectedProject"
                  class="rounded-2xl border border-indigo-100 bg-indigo-50 p-5"
                >
                  <div class="flex items-center gap-3">
                    <div class="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                      <FolderKanban :size="20" />
                    </div>
                    <div>
                      <h3 class="font-bold text-slate-900">
                        {{ selectedProject.title }}
                      </h3>
                      <p class="text-sm text-slate-500">اطلاعات پروژه</p>
                    </div>
                  </div>

                  <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="rounded-xl border bg-white p-4">
                      <p class="text-xs text-slate-500">دسته‌بندی</p>
                      <p class="mt-1 font-bold">{{ selectedProject.category }}</p>
                    </div>

                    <div class="rounded-xl border bg-white p-4">
                      <p class="text-xs text-slate-500">بودجه پروژه</p>
                      <p class="mt-1 font-bold text-emerald-600">
                        {{ selectedProject.minBudget?.toLocaleString() }}
                        -
                        {{ selectedProject.maxBudget?.toLocaleString() }}
                        تومان
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Amount -->
                <div>
                  <label class="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                    <BadgeDollarSign :size="18" />
                    مبلغ پیشنهادی (تومان)
                  </label>
                  <div class="relative">
                    <Wallet
                      :size="18"
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      :value="form.amount ?? ''"
                      @input="onlyNumber($event, 'amount')"
                      type="text"
                      inputmode="numeric"
                      dir="ltr"
                      placeholder="15000000"
                      class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 text-lg outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <!-- Delivery Days -->
                <div>
                  <label class="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                    <CalendarDays :size="18" />
                    زمان انجام پروژه (روز)
                  </label>
                  <input
                    :value="form.deliveryDays ?? ''"
                    @input="onlyNumber($event, 'deliveryDays')"
                    type="text"
                    inputmode="numeric"
                    dir="ltr"
                    placeholder="14"
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-lg outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <!-- Cover Letter -->
                <div>
                  <label class="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                    <FileText :size="18" />
                    متن پیشنهاد / کاور لتر
                  </label>
                  <textarea
                    v-model="form.coverLetter"
                    rows="6"
                    placeholder="توضیح دهید چرا شما بهترین گزینه برای انجام این پروژه هستید..."
                    class="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                  <p class="mt-2 text-xs text-slate-400 text-left">
                    {{ form.coverLetter.length }}/۱۰۰۰ کاراکتر
                  </p>
                </div>

                <!-- Error Message -->
                <Transition>
                  <div
                    v-if="error"
                    class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
                  >
                    {{ error }}
                  </div>
                </Transition>
              </div>

              <!-- Footer -->
              <div
                class="sticky bottom-0 border-t bg-white p-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
              >
                <button
                  type="button"
                  @click="proposalStore.closeModal"
                  class="rounded-2xl border border-slate-300 px-6 py-3 font-semibold transition hover:bg-slate-100"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-8 py-3 font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-70"
                >
                  <LoaderCircle v-if="isSubmitting" class="animate-spin" :size="20" />
                  {{ isSubmitting ? 'در حال ارسال...' : 'ارسال پیشنهاد' }}
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
