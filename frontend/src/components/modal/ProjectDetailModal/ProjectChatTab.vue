<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useChatStore, type ChatMessage } from '@/stores/chat.store'
import { useProjectStore } from '@/stores/project.store'
import { useAuthStore } from '@/stores/auth.store'
import { messageService } from '@/services/message.service'
import { Send, MessageCircle, LoaderCircle, UploadCloud, FileText } from 'lucide-vue-next'
import type { ProjectContract } from '@/types/project'

const chatStore = useChatStore()
const projectStore = useProjectStore()
const authStore = useAuthStore()

const messageContent = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const fileUploading = ref(false)
const chatPartner = computed(() => {
  const contract = projectStore.projectDetails?.contract as ProjectContract | null

  if (!contract) return null

  if (Number(currentUserId.value) === Number(contract.employer?.id)) {
    return contract.freelancer
  }

  return contract.employer
})
// دریافت اطلاعات قرارداد به طور مستقیم از جزئیات پروژه استور پروژه
const contract = computed(() => projectStore.projectDetails?.contract)
const messages = computed(() => chatStore.messages)

// اتصال دقیق به userId تعریف شده در استور احراز هویت
// اتصال دقیق و ایمن به استور شما
const currentUserId = computed(() => {
  const id = authStore.userId || localStorage.getItem('userId')

  // اگر آیدی وجود داشت، آن را عددی کن؛ در غیر این صورت null برگردان
  return id ? Number(id) : null
})
// مشخص کردن شناسه فرستنده و گیرنده برای مدیریت چپ و راست بودن پیام‌ها
// مشخص کردن شناسه فرستنده و گیرنده برای مدیریت چپ و راست بودن پیام‌ها
// مشخص کردن شناسه فرستنده و گیرنده برای مدیریت چپ و راست بودن پیام‌ها
const receiverId = computed(() => {
  const project = projectStore.projectDetails
  if (!project || !project.contract) return 0

  const employerId = Number(project.employerId)

  // ۱. تلاش برای پیدا کردن شناسه فریلنسر از پیام‌های موجود در چت
  // اولین پیامی که فرستنده‌اش کارفرما نبوده، قطعاً فریلنسر است
  const anyFreelancerMessage = chatStore.messages.find(
    (m: ChatMessage) => Number(m.senderId) !== employerId,
  )
  let freelancerId = anyFreelancerMessage ? Number(anyFreelancerMessage.senderId) : 0

  // ۲. اگر چت تازه بود و پیامی نبود، از فیلد پیش‌فرض قرارداد استفاده کند
  if (!freelancerId) {
    freelancerId = Number(project.contract.freelancerId || 0)
  }

  // ۳. اگر باز هم صفر بود، برای پروژه در حال اجرا (in_progress) موقتاً شناسه فریلنسر را از دیتای کمکی یا آیدی مخالف می‌گیریم
  if (!freelancerId && currentUserId.value !== employerId) {
    return employerId
  }

  // ۴. تعیین گیرنده نهایی
  if (currentUserId.value === employerId) {
    // اگر شما کارفرما هستید، گیرنده فریلنسر است (اگر هنوز 0 است، موقتاً شناسه مخالف کاربر برای تست فرستاده شود تا متد متوقف نشود)
    return freelancerId || 2
  } else {
    return employerId
  }
})
// اسکرول خودکار چت به پایین‌ترین نقطه
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 🌟 تابع لود اولیه اصلاح‌شده با لاگ دیباگ
const initChatRoom = async () => {
  // 🌟 کل دیتای پروژه را پرینت می‌کنیم تا ساختار دقیق فیلدهای بک‌اَند مشخص شود
  console.log('📦 [دیباگ چت] دیتای کامل جزئیات پروژه:', projectStore.projectDetails)

  if (contract.value?.id) {
    await chatStore.fetchChatHistory(contract.value.id)
    chatStore.initializeChat(contract.value.id)
    scrollToBottom()
  } else {
    console.warn('⚠️ [دیباگ چت] خطا: پروژه قرارداد ندارد یا id کانتراکت یافت نشد!')
  }
}

onMounted(() => {
  initChatRoom()
})

// اسکرول به پایین در صورت دریافت پیام جدید
watch(
  messages,
  () => {
    scrollToBottom()
  },
  { deep: true },
)

// قطع اتصال سوکت هنگام خروج از تب چت
onUnmounted(() => {
  chatStore.disconnectChat()
})

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const chooseFile = () => {
  fileInput.value?.click()
}

const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file || !contract.value?.id || !currentUserId.value) {
    target.value = ''
    return
  }

  fileUploading.value = true

  try {
    const response = await messageService.uploadChatFile(contract.value.id, file)
    const fileUrl = response.fileUrl as string
    const fileName = response.fileName as string

    chatStore.sendMessage(
      contract.value.id,
      currentUserId.value,
      receiverId.value,
      fileName || file.name,
      'file',
      fileUrl,
    )
  } catch (error) {
    console.error('❌ [دیباگ چت] خطا در آپلود فایل چت:', error)
    alert('خطا در آپلود فایل. لطفاً دوباره تلاش کنید.')
  } finally {
    fileUploading.value = false
    target.value = ''
  }
}

const handleSendMessage = () => {
  console.log('🚀 [دیباگ چت] دکمه ارسال فشرده شد')

  if (!currentUserId.value) {
    console.error('❌ [دیباگ چت] خطای احراز هویت: آی‌دی کاربر یافت نشد!')

    alert('خطا: سیستم قادر به تشخیص هویت شما نیست. لطفاً مجدداً وارد سایت شوید.')

    return
  }

  const content = messageContent.value.trim()

  if (!content || !contract.value?.id) {
    console.error('❌ [دیباگ چت] متن پیام خالی است یا Contract ID وجود ندارد.')

    return
  }

  console.log('📝 پیام:', content)
  console.log('🆔 Contract ID:', contract.value.id)
  console.log('👤 Sender:', currentUserId.value)
  console.log('👥 Receiver:', receiverId.value)

  chatStore.sendMessage(contract.value.id, currentUserId.value, receiverId.value, content)

  messageContent.value = ''
}
</script>

<template>
  <div
    class="flex h-130 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-slate-50 via-white to-indigo-50 shadow-xl"
  >
    <!-- Empty State -->
    <div
      v-if="!contract"
      class="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <div
        class="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-500"
      >
        <MessageCircle :size="38" />
      </div>

      <div>
        <h3 class="font-bold text-slate-700">گفتگو فعال نیست</h3>

        <p class="mt-2 text-sm text-slate-500">
          گفتگو پس از تایید پیشنهاد و ایجاد قرارداد فعال خواهد شد.
        </p>
      </div>
    </div>

    <template v-else>
      <!-- Chat Header -->
      <div class="flex items-center gap-4 px-5 py-4 rounded-t-xl bg-white border-b">
        <div class="relative">
          <img
            v-if="chatPartner?.avatar"
            :src="chatPartner.avatar"
            class="w-14 h-14 rounded-full object-cover"
          />

          <div
            v-else
            class="w-14 h-14 rounded-full bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xl"
          >
            {{ chatPartner?.name?.charAt(0) }}
          </div>

          <span
            class="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"
          />
        </div>

        <div>
          <h3 class="font-bold text-slate-800">
            {{ chatPartner?.name }}
          </h3>

          <p class="text-xs text-slate-500">
            {{ chatPartner?.role === 'employer' ? 'کارفرما' : 'فریلنسر' }}
          </p>
        </div>
      </div>
      <!-- Messages -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
        <div
          v-if="chatStore.isLoading"
          class="flex items-center justify-center gap-2 text-sm text-slate-400"
        >
          <LoaderCircle class="animate-spin" :size="18" />

          در حال دریافت پیام‌ها...
        </div>

        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex gap-3"
          :class="[msg.senderId === currentUserId ? 'justify-start' : 'justify-end']"
        >
          <!-- Avatar -->
          <div
            v-if="msg.senderId !== currentUserId"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600"
          >
            {{ msg.sender?.name?.charAt(0) || 'U' }}
          </div>

          <!-- Bubble -->
          <div
            :class="[
              'max-w-[75%] rounded-3xl px-4 py-3 shadow-sm',
              msg.senderId === currentUserId
                ? 'bg-linear-to-br from-indigo-600 to-indigo-500 text-white rounded-br-md'
                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md',
            ]"
          >
            <div class="mb-1 text-[11px] font-semibold opacity-70">
              {{ msg.sender?.name || 'کاربر' }}
            </div>

            <div class="space-y-2">
              <p v-if="msg.type === 'text'" class="whitespace-pre-line text-sm leading-7">
                {{ msg.content }}
              </p>

              <a
                v-if="msg.type === 'file' && msg.fileUrl"
                :href="msg.fileUrl"
                target="_blank"
                rel="noreferrer noopener"
                class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                <FileText :size="16" />
                <span>{{ msg.fileName || msg.content || 'فایل' }}</span>
              </a>
            </div>

            <div
              class="mt-2 text-[10px] opacity-60"
              :class="msg.senderId === currentUserId ? 'text-left' : 'text-right'"
            >
              {{ formatTime(msg.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <form
        @submit.prevent="handleSendMessage"
        class="border-t border-slate-200 bg-white/80 backdrop-blur p-4"
      >
        <div
          class="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-200"
        >
          <button
            type="button"
            @click="chooseFile"
            :disabled="fileUploading"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UploadCloud :size="18" />
          </button>

          <textarea
            v-model="messageContent"
            rows="1"
            placeholder="پیام خود را بنویسید..."
            @keydown.enter.exact.prevent="handleSendMessage"
            class="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />

          <button
            type="submit"
            :disabled="!messageContent.trim()"
            class="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send :size="18" class="rotate-180" />
          </button>

          <input ref="fileInput" type="file" class="hidden" @change="handleFileSelected" />
        </div>
        <div v-if="fileUploading" class="mt-2 text-sm text-slate-500">در حال آپلود فایل...</div>
      </form>
    </template>
  </div>
</template>
