import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // ── Public ────────────────────────────────────────────────────────────────
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'AccessoryHub – Premium Phone Accessories' }
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('@/views/ProductsView.vue'),
    meta: { title: 'Shop – AccessoryHub' }
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: () => import('@/views/ProductDetailView.vue'),
    meta: { title: 'Product – AccessoryHub' }
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/CartView.vue'),
    meta: { title: 'Your Cart – AccessoryHub' }
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Login – AccessoryHub', guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: 'Create Account – AccessoryHub', guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/ForgotPasswordView.vue'),
    meta: { title: 'Forgot Password – AccessoryHub', guestOnly: true }
  },

  // ── Protected ─────────────────────────────────────────────────────────────
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/CheckoutView.vue'),
    meta: { title: 'Checkout – AccessoryHub', requiresAuth: true }
  },
  {
    path: '/order-confirmation/:id',
    name: 'order-confirmation',
    component: () => import('@/views/OrderConfirmationView.vue'),
    meta: { title: 'Order Confirmed – AccessoryHub', requiresAuth: true }
  },

  // ── Account ───────────────────────────────────────────────────────────────
  {
    path: '/account',
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'account-profile' }
      },
      {
        path: 'profile',
        name: 'account-profile',
        component: () => import('@/views/account/ProfileView.vue'),
        meta: { title: 'My Profile – AccessoryHub' }
      },
      {
        path: 'orders',
        name: 'account-orders',
        component: () => import('@/views/account/OrdersView.vue'),
        meta: { title: 'My Orders – AccessoryHub' }
      },
      {
        path: 'orders/:id',
        name: 'account-order-detail',
        component: () => import('@/views/account/OrderDetailView.vue'),
        meta: { title: 'Order Details – AccessoryHub' }
      },
      {
        path: 'wishlist',
        name: 'account-wishlist',
        component: () => import('@/views/account/WishlistView.vue'),
        meta: { title: 'My Wishlist – AccessoryHub' }
      }
    ]
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: { name: 'admin-dashboard' }
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: 'Dashboard – Admin' }
      },
      {
        path: 'products',
        name: 'admin-products',
        component: () => import('@/views/admin/ProductsView.vue'),
        meta: { title: 'Products – Admin' }
      },
      {
        path: 'products/new',
        name: 'admin-product-create',
        component: () => import('@/views/admin/ProductFormView.vue'),
        meta: { title: 'Add Product – Admin' }
      },
      {
        path: 'products/:id/edit',
        name: 'admin-product-edit',
        component: () => import('@/views/admin/ProductFormView.vue'),
        meta: { title: 'Edit Product – Admin' }
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: () => import('@/views/admin/CategoriesView.vue'),
        meta: { title: 'Categories – Admin' }
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: () => import('@/views/admin/OrdersView.vue'),
        meta: { title: 'Orders – Admin' }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/UsersView.vue'),
        meta: { title: 'Users – Admin' }
      },
      {
        path: 'homepage',
        name: 'admin-homepage',
        component: () => import('@/views/admin/HomepageManagerView.vue'),
        meta: { title: 'Homepage Manager – Admin' }
      }
    ]
  },

  // ── 404 ───────────────────────────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '404 – AccessoryHub' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  }
})

// ── Navigation guards ──────────────────────────────────────────────────────
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'AccessoryHub'

  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return next({ name: 'home' })
  }

  if (to.meta.requiresAdmin && auth.user?.role !== 'admin') {
    return next({ name: 'home' })
  }

  next()
})

export default router
