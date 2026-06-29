<script setup lang="ts">
import { Quote } from 'lucide-vue-next'
</script>

<template>
  <div
    class="p-6 rounded-[2.5rem] bg-gradient-to-br from-white/80 to-emerald-50/50 backdrop-blur-xl border border-white shadow-lg relative overflow-hidden"
  >
    <Quote class="absolute -top-2 -left-2 w-16 h-16 text-emerald-100 opacity-50" />

    <p class="text-slate-600 text-sm leading-7 mb-6 relative z-10 italic">
      "همکاری با این پلتفرم باعث شد در کمترین زمان ممکن، دقیق‌ترین نقشه اجرایی را برای پروژه
      ساختمانی‌مان دریافت کنیم."
    </p>

    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-xs"
      >
        م.ر
      </div>
      <div>
        <h4 class="text-sm font-bold text-slate-800">مهندس رستمی</h4>
        <p class="text-[10px] text-slate-400 font-medium text-right uppercase">
          مدیر پروژه - شرکت عمران گستر
        </p>
      </div>
    </div>
  </div>
</template>
