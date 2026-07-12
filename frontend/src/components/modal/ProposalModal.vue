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
      <!-- بستن مودال با کلیک روی فضای بیرونی به کمک click.self -->
      <div
        v-if="isModalOpen"
        @click.self="proposalStore.closeModal"
        class="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 dir-rtl"
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
            class="relative w-full max-w-2xl rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-950/10 max-h-[90vh] overflow-hidden flex flex-col"
          >
            <!-- Header (لوکس و مینی‌مال) -->
            <div
              class="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5"
            >
              <div>
                <h2 class="text-lg font-bold text-slate-900">ارسال پیشنهاد همکاری</h2>
                <p class="text-xs text-slate-400 mt-1">جزییات و قیمت پیشنهادی خود را وارد کنید.</p>
              </div>

              <button
                @click="proposalStore.closeModal"
                class="group rounded-xl border border-slate-100 bg-white p-2 text-slate-400 shadow-sm transition-all duration-200 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-600 active:scale-95"
              >
                <X :size="16" class="transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </div>

            <!-- Form & Content Area -->
            <form
              @submit.prevent="proposalStore.submit"
              class="flex flex-col flex-1 overflow-hidden"
            >
              <div
                class="overflow-y-auto space-y-6 p-6 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200"
              >
                <!-- Project Info (کارت اطلاعات بازطراحی شده) -->
                <div
                  v-if="selectedProject"
                  class="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50"
                    >
                      <FolderKanban :size="18" />
                    </div>
                    <div>
                      <h3 class="text-sm font-semibold text-slate-800">
                        {{ selectedProject.title }}
                      </h3>
                      <p class="text-[11px] text-slate-400 font-light mt-0.5">
                        اطلاعات اولیه پروژه هدف
                      </p>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div class="rounded-xl border border-slate-100 bg-white p-3.5">
                      <p class="text-[11px] font-medium text-slate-400">دسته‌بندی</p>
                      <p class="mt-1 text-xs font-semibold text-slate-700">
                        {{ selectedProject.category }}
                      </p>
                    </div>

                    <div class="rounded-xl border border-slate-100 bg-white p-3.5">
                      <p class="text-[11px] font-medium text-slate-400">بودجه کارفرما</p>
                      <p class="mt-1 text-xs font-bold text-emerald-600">
                        {{ selectedProject.minBudget?.toLocaleString() }}
                        تا
                        {{ selectedProject.maxBudget?.toLocaleString() }}
                        <span class="text-[10px] font-normal text-slate-400 mr-0.5">تومان</span>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Fields Grid -->
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <!-- Amount -->
                  <div class="space-y-2">
                    <label class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <BadgeDollarSign :size="15" class="text-slate-400" />
                      مبلغ پیشنهادی شما
                    </label>
                    <div
                      class="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/60 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 transition-all duration-200"
                    >
                      <input
                        :value="form.amount ?? ''"
                        @input="onlyNumber($event, 'amount')"
                        type="text"
                        inputmode="numeric"
                        dir="ltr"
                        placeholder="قیمت را به عدد وارد کنید"
                        class="w-full bg-transparent py-3 pr-4 pl-12 text-sm font-semibold text-slate-700 focus:outline-none placeholder:text-slate-400 placeholder:font-light"
                      />
                      <Wallet :size="16" class="absolute left-4 text-slate-400/80" />
                    </div>
                  </div>

                  <!-- Delivery Days -->
                  <div class="space-y-2">
                    <label class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <CalendarDays :size="15" class="text-slate-400" />
                      زمان مورد نیاز (روز)
                    </label>
                    <div
                      class="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/60 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 transition-all duration-200"
                    >
                      <input
                        :value="form.deliveryDays ?? ''"
                        @input="onlyNumber($event, 'deliveryDays')"
                        type="text"
                        inputmode="numeric"
                        dir="ltr"
                        placeholder="مثلا ۱۴"
                        class="w-full bg-transparent py-3 px-4 text-sm font-semibold text-slate-700 focus:outline-none placeholder:text-slate-400 placeholder:font-light"
                      />
                    </div>
                  </div>
                </div>

                <!-- Cover Letter -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <FileText :size="15" class="text-slate-400" />
                    توضیحات و کاور لتر (مقررات و شیوه انجام)
                  </label>
                  <div
                    class="bg-slate-50 rounded-xl border border-slate-200/60 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 transition-all duration-200 p-1"
                  >
                    <textarea
                      v-model="form.coverLetter"
                      rows="5"
                      placeholder="توضیح دهید چرا مهارت‌های شما دقیقاً پاسخگوی نیازمندی‌های این پروژه است..."
                      class="w-full resize-none bg-transparent p-3 text-sm text-slate-700 focus:outline-none placeholder:text-slate-400/80 placeholder:font-light leading-relaxed"
                    />
                  </div>
                  <div class="flex justify-between items-center px-1">
                    <span class="text-[10px] text-slate-400 font-light"
                      >حداکثر ۱۰۰۰ کاراکتر مجاز</span
                    >
                    <span
                      class="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded"
                    >
                      {{ form.coverLetter.length }}/1000
                    </span>
                  </div>
                </div>

                <!-- Error Message -->
                <Transition
                  enter-active-class="duration-200 ease-out"
                  enter-from-class="opacity-0 -translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                >
                  <div
                    v-if="error"
                    class="rounded-xl border border-red-100 bg-red-50/60 p-4 text-xs font-medium text-red-600 backdrop-blur-sm"
                  >
                    {{ error }}
                  </div>
                </Transition>
              </div>

              <!-- Footer (فیکس شده در پایین با دکمه‌های کپسولی غنی) -->
              <div
                class="border-t border-slate-100 bg-white p-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
              >
                <button
                  type="button"
                  @click="proposalStore.closeModal"
                  class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-98"
                >
                  انصراف و بازگشت
                </button>

                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-500/20 active:scale-98 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <LoaderCircle v-if="isSubmitting" class="animate-spin" :size="14" />
                  {{ isSubmitting ? 'در حال ثبت اطلاعات...' : 'ثبت قطعی پیشنهاد' }}
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dir-rtl {
  direction: rtl;
}
</style>
