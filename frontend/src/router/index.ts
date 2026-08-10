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
import AdminLayout from '../components/admin/AdminLayout/AdminLayout.vue'
import AdminDashboardPage from '../pages/AdminDashboardPage.vue'
import AdminUsersPage from '../pages/AdminUserPage.vue'
import AdminUserDetailPage from '../pages/AdminUserDetailPage.vue'
import AdminProjectPage from '../pages/AdminProjectPage.vue'
import AdminProjectDetailPage from '../pages/AdminProjectDetailPage.vue'
import AdminProposalPage from '../pages/AdminProposalPage.vue'
import AdminContractPage from '@/pages/AdminContractPage.vue'
import AdminContractDetailPage from '../pages/AdminContractDetailPage.vue'
import AdminPaymentPage from '../pages/AdminPaymentPage.vue'
import AdminCategoryPage from '../pages/AdminCategoryPage.vue'
import AdminSkillPage from '../pages/AdminSkillPage.vue'
import AdminMessagePage from '../pages/AdminMessagePage.vue'
import AdminReviewPage from '../pages/AdminReviewPage.vue'
import AdminFilePage from '../pages/AdminFilePage.vue'
import AdminReportPage from '../pages/AdminReportPage.vue'
import AdminActivityLogPage from '@/pages/AdminActivityLogPage.vue'
import AdminSettingPage from '@/pages/AdminSettingPage.vue'
import AdminNotificationPage from '../pages/AdminNotificationPage.vue'

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
      // ⚠️ دیگر requiresGuest نمی‌گذاریم تا کاربر عادی هم بتواند وارد صفحه لاگین ادمین شود
    },

    // --- مسیرهای پنل مدیریت ---
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard',
        },
        {
          path: 'skills',
          component: AdminSkillPage,
        },
        {
          path: 'dashboard',
          component: AdminDashboardPage,
        },
        {
          path: 'settings',
          component: AdminSettingPage,
          meta: { permission: 'settings.view' },
        },
        {
          path: 'notifications',
          component: AdminNotificationPage,
        },

        {
          path: 'activity-logs',
          component: AdminActivityLogPage,
          meta: { permission: 'settings.view' },
        },
        {
          path: 'reports',
          component: AdminReportPage,
          meta: { permission: 'reports.view' },
        },
        {
          path: 'reviews',
          component: AdminReviewPage,
          meta: { permission: 'reviews.view' },
        },
        {
          path: 'files',
          component: AdminFilePage,
          meta: { permission: 'settings.view' },
        },
        {
          path: 'categories',
          component: AdminCategoryPage,
        },

        {
          path: 'proposals',
          component: AdminProposalPage,
          meta: { permission: 'proposals.view' },
        },
        {
          path: 'contracts',
          component: AdminContractPage,
        },
        {
          path: 'contracts/:id',
          component: AdminContractDetailPage,
        },
        {
          path: 'users',
          component: AdminUsersPage,
          meta: { permission: 'users.view' }, // 🌟 مثال دسترسی
        },
        {
          path: 'users/:id',
          component: AdminUserDetailPage,
          meta: { permission: 'users.view' },
        },
        {
          path: 'payments',
          component: AdminPaymentPage,
        },
        {
          path: 'projects/:id',
          component: AdminProjectDetailPage,
          meta: { permission: 'projects.view' },
        },
        {
          path: 'projects',
          component: AdminProjectPage,
          meta: { permission: 'projects.view' },
        },
        {
          path: 'messages',
          component: AdminMessagePage,
          meta: { permission: 'messages.view' },
        },
        // مسیرهای بعدی را اینجا اضافه کن:
        // { path: 'projects', component: ..., meta: { permission: 'projects.view' } },
        // { path: 'payments', component: ..., meta: { permission: 'payments.view' } },
      ],
    },

    // --- روت‌های محافظت‌شده کاربری ---
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
    }
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const adminStore = useAdminStore()

  // همیشه هدر ادمین را ست کن اگر توکن دارد
  if (adminStore.token) {
    adminStore.setAuthHeader()
  }

  const isAdminRoute = to.path.startsWith('/admin')
  const isAdminLoginPage = to.path === '/admin/login'

  // ---------- مسیرهای ادمین ----------
  if (isAdminRoute) {
    // صفحه لاگین ادمین
    if (isAdminLoginPage) {
      if (adminStore.token) {
        return next('/admin/dashboard')
      }
      return next()
    }

    // بقیه مسیرهای /admin/*
    if (!adminStore.token) {
      return next('/admin/login')
    }

    // چک دسترسی خاص (اگر meta.permission تعریف شده باشد)
    const requiredPermission = to.meta.permission as string | undefined
    if (requiredPermission && !adminStore.hasPermission(requiredPermission)) {
      // می‌توانی به صفحه 403 بفرستی یا به داشبورد
      return next('/admin/dashboard')
    }

    return next()
  }

  // ---------- مسیرهای عادی کاربر ----------
  if (to.meta.requiresAuth && !authStore.token) {
    return next('/signup')
  }

  if (to.meta.requiresGuest && authStore.token) {
    return next('/dashboard')
  }

  return next()
})

export default router
