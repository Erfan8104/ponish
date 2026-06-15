import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '../pages/LoginPage.vue'
import OtpView from '../pages/OtpPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import HomePage from '../pages/HomePage.vue'
import PasswordView from '../pages/PasswordPage.vue'
import SignupPage from '../pages/SignupPage.vue'
import CreateUsername from '../pages/CreateUsername.vue'
import WelcomePage from '../pages/WelcomePage.vue'
import NewprojectPage from '../pages/NewprojectPage.vue'
import ProfilePage from '../pages/profile.vue'

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
    },
    {
      path: '/signup',
      component: SignupPage,
    },

    {
      path: '/login/otp',
      component: OtpView,
    },
    {
      path: '/login/password',
      component: PasswordView,
    },

    {
      path: '/dashboard',
      component: DashboardPage,
    },
    {
      path: '/onboarding/create-username',
      component: CreateUsername,
    },
    {
      path: '/onboarding/welcome',
      component: WelcomePage,
    },
    {
      path: '/newproject',
      component: NewprojectPage,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfilePage,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      // اگر کاربر دکمه Back مرورگر را زد، به همان پوزیشن قبلی برگردد
      return savedPosition
    } else {
      // در غیر این صورت، برای هر روت جدید اسکرول به بالاترین نقطه (Top) برود
      return { top: 0, behavior: 'smooth' } // می‌توانید behavior: 'smooth' را برای انیمیشن نرم بگذارید یا حذف کنید
    }
  },
})

export default router
