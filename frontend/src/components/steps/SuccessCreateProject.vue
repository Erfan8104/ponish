<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  projectTitle: string
}>()

// ایجاد یک شماره پیگیری تصادفی شکیل برای ارائه‌ به کارفرما
const trackingCode = ref('')

onMounted(() => {
  trackingCode.value = 'SURV-' + Math.floor(100000 + Math.random() * 900000)
})
</script>

<template>
  <div class="text-center py-12 max-w-md mx-auto space-y-6" style="direction: rtl">
    <div
      class="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm border border-emerald-100 animate-bounce"
    >
      ✅
    </div>

    <div class="space-y-2">
      <h2 class="text-xl font-black text-gray-800">پروژه شما با موفقیت ثبت شد!</h2>
      <p class="text-xs text-gray-500 leading-relaxed px-4">
        اطلاعات پروژه <span class="font-bold text-gray-700">«{{ projectTitle }}»</span> دریافت شد و
        در صف بررسی کارشناسان قرار گرفت.
      </p>
    </div>

    <div class="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3 text-right">
      <div class="flex justify-between items-center text-xs">
        <span class="text-gray-500">شماره پیگیری:</span>
        <span class="font-mono font-black text-gray-800 tracking-wider">{{ trackingCode }}</span>
      </div>

      <div class="flex justify-between items-center text-xs">
        <span class="text-gray-500">وضعیت فعلی:</span>
        <span class="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md font-bold text-[10px]">
          ⏳ در انتظار تایید و ارجاع
        </span>
      </div>

      <hr class="border-gray-200/60 my-2" />

      <p class="text-[11px] text-gray-500 leading-relaxed text-center pt-1">
        📞 کارشناسان ما حداکثر تا <strong>۲ ساعت آینده</strong> جهت هماهنگی اولیه و نهایی کردن قیمت
        با شما تماس خواهند گرفت.
      </p>
    </div>

    <div class="space-y-3 pt-4">
      <button
        type="button"
        @click="$emit('reset')"
        class="w-full py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-sm"
      >
        ورود به داشبورد پروژه‌ها
      </button>

      <button
        type="button"
        @click="$emit('reset')"
        class="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all"
      >
        ثبت پروژه جدید نقشه‌برداری
      </button>
    </div>
  </div>
</template>
