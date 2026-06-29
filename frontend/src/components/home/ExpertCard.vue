<script setup lang="ts">
import { Star, CheckCircle2 } from 'lucide-vue-next'
defineProps(['expert'])
</script>

<template>
  <div
    class="p-5 rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white shadow-lg hover:shadow-xl transition-all"
  >
    <div class="flex items-center gap-4 mb-4">
      <div class="relative">
        <img
          src="https://i.pravatar.cc/150?u=expert"
          class="w-16 h-16 rounded-2xl object-cover border-2 border-white"
        />
        <CheckCircle2 class="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 fill-white" />
      </div>
      <div>
        <h4 class="font-bold text-slate-800">مهندس آرش علوی</h4>
        <p class="text-xs text-slate-500">متخصص فتوگرامتری پهپاد</p>
      </div>
    </div>

    <div class="flex items-center justify-between py-3 border-y border-slate-100 mb-4">
      <div class="flex items-center gap-1 text-amber-500">
        <Star class="w-4 h-4 fill-current" />
        <span class="text-sm font-bold">۴.۹</span>
      </div>
      <div class="text-xs text-slate-400 font-medium">۸۵ پروژه موفق</div>
    </div>

    <button
      class="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition"
    >
      مشاهده پروفایل
    </button>
  </div>
</template>
