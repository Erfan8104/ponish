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
import AdminLoginPage from '../pages/AdminLoginPage.vue'
import AdminUsersPage from '../pages/AdminUserPage.vue'
import { useAdminStore } from '@/stores/admin.store'

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
    {
      path: '/admin/login',
      component: AdminLoginPage,
      meta: { requiresGuest: true },
    },
    {
      path: '/admin/users',
      component: AdminUsersPage,
      meta: { requiresAuth: true, requiresAdmin: true },
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const adminStore = useAdminStore()

  // 🌟 اگر توکن ادمین وجود دارد، مطمئن شویم هدر آکسیوس ست شده است
  if (adminStore.token) {
    adminStore.setAuthHeader()
  }

  const isAdminRoute = to.path.startsWith('/admin')
  const isAdminLoginPage = to.path === '/admin/login'

  // سناریو ۱: اگر مسیر مربوط به ادمین است (به جز صفحه لاگین ادمین)
  if (isAdminRoute && !isAdminLoginPage) {
    if (!adminStore.token) {
      return next('/admin/login')
    }
    return next()
  }

  // سناریو ۲: اگر ادمینِ لاگین‌شده می‌خواهد دوباره برود صفحه لاگین ادمین
  if (isAdminLoginPage && adminStore.token) {
    return next('/admin/users')
  }

  // سناریو ۳: صفحه نیاز به احراز هویت کاربر عادی دارد اما توکن ندارد
  if (to.meta.requiresAuth && !authStore.token) {
    return next('/signup')
  }

  // سناریو ۴: کاربر عادی لاگین کرده اما می‌خواهد برود صفحات مهمان
  if (to.meta.requiresGuest && authStore.token) {
    return next('/dashboard')
  }

  return next()
})
export default router
