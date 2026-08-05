import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useAdminStore } from '@/stores/admin.store'

// صفحات عمومی و کاربر
import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import SignupPage from '../pages/SignupPage.vue'
import OtpView from '../pages/OtpPage.vue'
import PasswordView from '../pages/PasswordPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import CreateUsername from '../pages/CreateUsername.vue'
import WelcomePage from '../pages/WelcomePage.vue'
import NewprojectPage from '../pages/CreateProjectPage.vue'
import ProfilePage from '../pages/profilePage.vue'
import ConsultationPage from '@/pages/consultationPage.vue'

// صفحات و لایوت مدیریت
import AdminLoginPage from '../pages/AdminLoginPage.vue'
import AdminLayout from '../components/admin/AdminLayout/AdminLayout.vue' // یا مسیر دقیق قرارگیری این کامپوننت
import AdminDashboardPage from '../pages/AdminDashboardPage.vue'
import AdminUsersPage from '../pages/AdminUserPage.vue'

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
      meta: { requiresGuest: true },
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

    // --- مسیرهای پنل مدیریت تحت لایوت AdminLayout ---
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard',
        },
        {
          path: 'dashboard',
          component: AdminDashboardPage,
        },
        {
          path: 'users',
          component: AdminUsersPage,
        },
        // در صورت نیاز به روت‌های دیگر ادمین مانند پروژه‌ها و قراردادها، اینجا اضافه خواهند شد
      ],
    },

    // --- روت‌های محافظت شده کاربری ---
    {
      path: '/dashboard',
      component: DashboardPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/consultation',
      name: 'consultation',
      component: ConsultationPage,
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

  if (adminStore.token) {
    adminStore.setAuthHeader()
  }

  const isAdminLoginPage = to.path === '/admin/login'

  // سناریو ۱: مسیر نیاز به احراز هویت ادمین دارد
  if (to.meta.requiresAdmin) {
    if (!adminStore.token) {
      return next('/admin/login')
    }
    return next()
  }

  // سناریو ۲: ادمینِ لاگین‌شده می‌خواهد دوباره برود صفحه لاگین ادمین
  if (isAdminLoginPage && adminStore.token) {
    return next('/admin/dashboard')
  }

  if (to.meta.requiresAuth && !authStore.token) {
    return next('/signup')
  }

  if (to.meta.requiresGuest && authStore.token) {
    return next('/dashboard')
  }

  return next()
})

export default router
