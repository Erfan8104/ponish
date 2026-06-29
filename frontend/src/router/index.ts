import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store' // ۱. ایمپورت کردن استور پینیا

import LoginPage from '../pages/LoginPage.vue'
import OtpView from '../pages/OtpPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import HomePage from '../pages/HomePage.vue'
import PasswordView from '../pages/PasswordPage.vue'
import SignupPage from '../pages/SignupPage.vue'
import CreateUsername from '../pages/CreateUsername.vue'
import WelcomePage from '../pages/WelcomePage.vue'
import NewprojectPage from '../pages/CreateProjectPage.vue'
import ProfilePage from '../pages/profilePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/login',
      component: LoginPage,
      meta: { requiresGuest: true }, // ۲. کاربر لاگین شده نباید دوباره بتونه بیاد این صفحه
    },
    {
      path: '/signup',
      component: SignupPage,
      meta: { requiresGuest: true },
    },
    {
      path: '/login/otp',
      component: OtpView,
      meta: { requiresGuest: true },
    },
    {
      path: '/login/password',
      component: PasswordView,
      meta: { requiresGuest: true },
    },

    // --- روت‌های محافظت شده (نیاز به لاگین دارند) ---
    {
      path: '/dashboard',
      component: DashboardPage,
      meta: { requiresAuth: true }, // ۳. اضافه کردن روت گارد
    },
    {
      path: '/onboarding/create-username',
      component: CreateUsername,
      meta: { requiresAuth: true },
    },
    {
      path: '/onboarding/welcome',
      component: WelcomePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/newproject',
      component: NewprojectPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfilePage,
      meta: { requiresAuth: true },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  },
})

// ۴. پیاده‌سازی منطق روت گارد قبل از جابجایی بین صفحات
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore() // دسترسی به پینیا و توکن کاربر

  // سناریو اول: صفحه نیاز به احراز هویت دارد اما کاربر توکن ندارد (لاگین نکرده)
  if (to.meta.requiresAuth && !authStore.token) {
    next('/signup') // بفرستش صفحه ثبت نام/ورود
  }

  // سناریو دوم: کاربر لاگین کرده اما می‌خواهد دستی آدرس /login یا /signup را باز کند!
  else if (to.meta.requiresGuest && authStore.token) {
    next('/dashboard') // برش گردان به داشبورد خودش
  }

  // در غیر این صورت اجازه بده عبور کند
  else {
    next()
  }
})

export default router
