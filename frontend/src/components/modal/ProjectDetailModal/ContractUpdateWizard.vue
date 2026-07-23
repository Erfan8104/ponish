<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Ruler, DollarSign, Clock, FileCheck, ArrowRight, ArrowLeft, X } from 'lucide-vue-next'
import { useContractStore } from '@/stores/contract.store'

const contractStore = useContractStore()
const currentStep = ref(1)
const totalSteps = 4

// ⚡ تعیین حالت ویرایش در مرحله اول ('area' برای مساحت، 'length' برای طول کریدور)
// پیش‌فرض را بر اساس وجود طول یا مساحت در پروژه تنظیم می‌کنیم
const initialIsCorridor = Boolean(
  contractStore.currentProject?.corridorLength !== null &&
  contractStore.currentProject?.corridorLength !== undefined,
)
const editMode = ref<'area' | 'length'>(initialIsCorridor ? 'length' : 'area')

// ⚡ دریافت مستقیم متغیرها از استور پینیا
const contractId = computed(() => contractStore.currentContract?.id)
const currentArea = computed(() => contractStore.currentProject?.calculatedArea || '')
const currentLength = computed(() => contractStore.currentProject?.corridorLength || '')
const currentAmount = computed(
  () => contractStore.currentContract?.amount || contractStore.currentContract?.finalAmount || 0,
)
const currentDeliveryTime = computed(() => contractStore.currentContract?.deliveryTime || '')

// فرم دیتا برای نگهداری مقادیر ورودی کارفرما
const formData = ref({
  updatedArea: currentArea.value,
  updatedLength: currentLength.value,
  updatedAmount: currentAmount.value,
  updatedDeliveryTime: currentDeliveryTime.value,
  description: '',
})

// ⚡ واچ‌کردن مقادیر استور تا در صورت لود تأخیری دیتا، فرم به درستی پر شود
watch(
  [currentArea, currentLength, currentAmount, currentDeliveryTime],
  ([newArea, newLength, newAmount, newDelivery]) => {
    formData.value.updatedArea = newArea
    formData.value.updatedLength = newLength
    formData.value.updatedAmount = newAmount
    formData.value.updatedDeliveryTime = newDelivery
  },
  { immediate: true },
)

const nextStep = () => {
  if (currentStep.value < totalSteps) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

// ثبت مستقیم اطلاعات در استور
const handleSubmit = async () => {
  if (!contractId.value) return

  try {
    // 🌟 ارسال مقدار بر اساس انتخابی که کارفرما در فرم انجام داده است
    await contractStore.createContractAmendment(contractId.value, {
      area: editMode.value === 'area' ? Number(formData.value.updatedArea) : null,
      length: editMode.value === 'length' ? Number(formData.value.updatedLength) : null,
      amount: Number(formData.value.updatedAmount),
      deliveryTime: Number(formData.value.updatedDeliveryTime),
      description: formData.value.description,
    })

    // بازگرداندن فرم به حالت اول پس از ثبت موفق
    currentStep.value = 1
    formData.value.description = ''
  } catch (error) {
    alert(error)
  }
}
</script>

<template>
  <!-- استفاده مستقیم از وضعیت استور برای نمایش مودال و بستن آن -->
  <div
    v-if="contractStore.isOpenAmendmentModal"
    @click.self="contractStore.isOpenAmendmentModal = false"
    class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 dir-rtl cursor-pointer"
  >
    <div
      class="relative w-full max-w-2xl rounded-[24px] border border-white/20 bg-white p-6 shadow-2xl flex flex-col max-h-[90vh] cursor-default"
    >
      <!-- هدر مودال فرم -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <h3 class="text-base font-bold text-slate-800">بستن قرارداد نهایی و اصلاح</h3>
        <button
          @click="contractStore.isOpenAmendmentModal = false"
          class="rounded-lg p-1.5 hover:bg-slate-100 text-slate-400"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- استپر مینی‌مال (وضعیت ۴ مرحله‌ای) -->
      <div class="flex items-center justify-center gap-2 mb-8 select-none">
        <div v-for="step in totalSteps" :key="step" class="flex items-center">
          <div
            class="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
            :class="
              currentStep >= step
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-400'
            "
          >
            {{ step }}
          </div>
          <div
            v-if="step < totalSteps"
            class="h-0.5 w-12 sm:w-16 mx-1 rounded transition-all duration-300"
            :class="currentStep > step ? 'bg-blue-600' : 'bg-slate-200'"
          ></div>
        </div>
      </div>

      <!-- محتوای مراحل فرم -->
      <div class="flex-1 overflow-y-auto px-2">
        <!-- 🌟 مرحله اول: انتخاب نوع پارامتر و ورود مقدار (توسط خود کارفرما) -->
        <div v-if="currentStep === 1" class="space-y-4 animate-fade-in">
          <div class="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <Ruler class="h-5 w-5 text-blue-500" />
            <h4>مرحله اول: انتخاب نوع پارامتر قابل ویرایش پروژه</h4>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            لطفاً مشخص کنید که برای اصلاح این قرارداد، تمایل دارید «مساحت حوزه» را ویرایش کنید یا
            «طول مسیر (کریدور)» را؟
          </p>

          <!-- دکمه‌های انتخاب‌گر (Toggle Switch) -->
          <div class="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl my-3">
            <button
              type="button"
              @click="editMode = 'area'"
              class="py-2.5 text-xs font-bold rounded-xl transition-all"
              :class="
                editMode === 'area'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              "
            >
              مساحت حوزه (متر مربع)
            </button>
            <button
              type="button"
              @click="editMode = 'length'"
              class="py-2.5 text-xs font-bold rounded-xl transition-all"
              :class="
                editMode === 'length'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              "
            >
              طول کریدور / مسیر
            </button>
          </div>

          <!-- اینپوت مربوط به مساحت -->
          <div v-if="editMode === 'area'" class="space-y-2 mt-4 animate-fade-in">
            <label class="text-xs font-semibold text-slate-600 block">مساحت جدید (متر مربع):</label>
            <input
              v-model="formData.updatedArea"
              type="number"
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition"
              placeholder="مثال: ۱۵۰۰"
            />
          </div>

          <!-- اینپوت مربوط به طول کریدور -->
          <div v-if="editMode === 'length'" class="space-y-2 mt-4 animate-fade-in">
            <label class="text-xs font-semibold text-slate-600 block"
              >طول جدید مسیر (کیلومتر / واحد):</label
            >
            <input
              v-model="formData.updatedLength"
              type="number"
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition"
              placeholder="مثال: ۱۲.۵"
            />
          </div>
        </div>

        <!-- مرحله دوم: مبلغ قطعی -->
        <div v-if="currentStep === 2" class="space-y-4 animate-fade-in">
          <div class="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <DollarSign class="h-5 w-5 text-emerald-500" />
            <h4>مرحله دوم: تعیین مبلغ نهایی و قطعی قرارداد</h4>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            مبلغ نهایی توافق شده با نقشه‌بردار جهت انجام کل تعهدات را به تومان وارد نمایید.
          </p>
          <div class="space-y-2 mt-4">
            <label class="text-xs font-semibold text-slate-600 block">مبلغ نهایی (تومان):</label>
            <input
              v-model="formData.updatedAmount"
              type="number"
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition"
              placeholder="مثال: ۵۰۰۰۰۰۰"
            />
            <p
              v-if="formData.updatedAmount"
              class="text-left text-xs text-emerald-600 font-medium mt-1"
            >
              {{ Number(formData.updatedAmount).toLocaleString('fa-IR') }} تومان
            </p>
          </div>
        </div>

        <!-- مرحله سوم: مهلت زمان تحویل پروژه -->
        <div v-if="currentStep === 3" class="space-y-4 animate-fade-in">
          <div class="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <Clock class="h-5 w-5 text-amber-500" />
            <h4>مرحله سوم: تعیین مهلت زمان تحویل پروژه</h4>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            تعداد روزهای مورد نیاز جهت تحویل نهایی خروجی‌های پروژه توسط نقشه‌بردار را مشخص کنید.
          </p>
          <div class="space-y-2 mt-4">
            <label class="text-xs font-semibold text-slate-600 block">زمان تحویل (به روز):</label>
            <input
              v-model="formData.updatedDeliveryTime"
              type="number"
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition"
              placeholder="مثال: ۳۰"
            />
            <p
              v-if="formData.updatedDeliveryTime"
              class="text-left text-xs text-amber-600 font-medium mt-1"
            >
              {{ Number(formData.updatedDeliveryTime).toLocaleString('fa-IR') }} روز کاری
            </p>
          </div>
        </div>

        <!-- مرحله چهارم: خلاصه و تایید -->
        <div v-if="currentStep === 4" class="space-y-4 animate-fade-in">
          <div class="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <FileCheck class="h-5 w-5 text-indigo-500" />
            <h4>مرحله چهارم: خلاصه الحاقیه و تایید نهایی</h4>
          </div>
          <div
            class="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3 text-xs leading-6 text-slate-700"
          >
            <!-- نمایش مقدار بر اساس انتخاب کارفرما در خلاصه گزارش -->
            <div v-if="editMode === 'length'">
              🛣️ <strong>طول محور تنظیم شده:</strong>
              {{ Number(formData.updatedLength).toLocaleString('fa-IR') }} واحد
            </div>
            <div v-else>
              📐 <strong>مساحت تنظیم شده:</strong>
              {{ Number(formData.updatedArea).toLocaleString('fa-IR') }} متر مربع
            </div>

            <div>
              💰 <strong>مبلغ قطعی قرارداد:</strong>
              {{ Number(formData.updatedAmount).toLocaleString('fa-IR') }} تومان
            </div>
            <div>
              ⏳ <strong>مهلت زمان تحویل:</strong>
              {{ Number(formData.updatedDeliveryTime).toLocaleString('fa-IR') }} روز
            </div>
          </div>
          <div class="space-y-2 mt-2">
            <label class="text-xs font-semibold text-slate-600 block">توضیحات (اختیاری):</label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition resize-none"
              placeholder="دلیل تغییر پارامتر، توافق مالی یا زمان تحویل جدید..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- دکمه‌های ناوبری فرم -->
      <div class="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
        <button
          v-if="currentStep > 1"
          @click="prevStep"
          class="flex items-center gap-1 px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
          :disabled="contractStore.isProcessing"
        >
          <ArrowRight class="h-4 w-4" />
          مرحله قبل
        </button>
        <div v-else></div>

        <button
          v-if="currentStep < totalSteps"
          @click="nextStep"
          class="flex items-center gap-1 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
        >
          مرحله بعد
          <ArrowLeft class="h-4 w-4" />
        </button>

        <button
          v-else
          @click="handleSubmit"
          :disabled="contractStore.isProcessing"
          class="flex items-center gap-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-500/15 disabled:opacity-50"
        >
          {{ contractStore.isProcessing ? 'در حال ثبت...' : 'ثبت و اعمال در قرارداد' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.dir-rtl {
  direction: rtl;
}
</style>
