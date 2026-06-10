import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '../pages/LoginPage.vue'
import OtpView from '../pages/OtpPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import HomePage from '../pages/HomePage.vue'
import PasswordView from '../pages/PasswordPage.vue'
import SignupPage from '../pages/SignupPage.vue'

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
  ],
})

export default router
