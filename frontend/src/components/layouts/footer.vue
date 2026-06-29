<template>
  <footer
    class="bg-gray-950 text-gray-400 font-sans border-t border-gray-900 pt-12 pb-6"
    style="direction: rtl"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-right mb-12">
        <div class="col-span-2 md:col-span-1 space-y-4">
          <span class="text-lg font-black text-white block">GeoProject</span>
          <p class="text-xs text-gray-500 leading-relaxed font-medium">
            سامانه هوشمند و آنلاین کارگزاری پروژه‌های نقشه‌برداری، فتوگرامتری و تفکیک اراضی در کشور.
          </p>
        </div>

        <div class="space-y-3">
          <h4 class="text-sm font-bold text-gray-200">دسترسی سریع</h4>
          <ul class="space-y-2 text-xs">
            <li><a href="#" class="hover:text-white transition-colors">صفحه اصلی</a></li>
            <li>
              <router-link to="/create-project" class="hover:text-white transition-colors"
                >ثبت پروژه جدید</router-link
              >
            </li>
            <li><a href="#" class="hover:text-white transition-colors">تعرفه‌ها و خدمات</a></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="text-sm font-bold text-gray-200">راهنما و پشتیبانی</h4>
          <ul class="space-y-2 text-xs">
            <li><a href="#" class="hover:text-white transition-colors">قوانین و مقررات</a></li>
            <li><a href="#" class="hover:text-white transition-colors">حریم خصوصی</a></li>
            <li><a href="#" class="hover:text-white transition-colors">سوالات متداول</a></li>
          </ul>
        </div>

        <div class="space-y-3 col-span-2 md:col-span-1">
          <h4 class="text-sm font-bold text-gray-200">ارتباط با ما</h4>
          <ul class="space-y-2 text-xs text-gray-500 font-medium">
            <li class="flex items-center gap-2">
              <span>📍</span>
              <span class="text-gray-400">خراسان رضوی، مشهد</span>
            </li>
            <li class="flex items-center gap-2">
              <span>📞</span>
              <span class="text-gray-400" style="direction: ltr">۰۲۱-۱۲۳۴۵۶۷۸</span>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="border-t border-gray-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500"
      >
        <div>© ۲۰۲۶ سامانه هوشمند GeoProject. تمامی حقوق محفوظ است.</div>
        <div class="flex gap-4">
          <a href="#" class="hover:text-white transition-colors">تلگرام</a>
          <a href="#" class="hover:text-white transition-colors">لینکدین</a>
        </div>
      </div>
    </div>
  </footer>
</template>
