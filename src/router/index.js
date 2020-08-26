import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/home.vue'
import Welcome from '../components/welcome'
import user from '@/components/user/user'
import rights from '@/components/power/rights'
import roles from '@/components/power/roles'
import cate from '@/components/goods/cate'
import params from '@/components/goods/params'
import goods from '@/components/goods/goods'
import add from '@/components/goods/add'
import orders from '@/components/orders/orders'
import reports from '@/components/reports/reports'
import Layout from '@/components/Test/Layout'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome},
      { path: '/users', component: user },
      { path: '/rights', component: rights },
      { path: '/roles', component: roles },
      { path: '/categories', component: cate },
      { path: '/params', component: params },
      { path: '/goods', component: goods },
      { path: '/goods/add', component: add },
      { path: '/orders', component: orders },
      { path: '/reports', component: reports },
      { path: '/test', component: Layout },




    ]

  }
]
const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  // 如果用户访问的登录页,则放行
  if (to.path === '/login') return next()
  //从sessionstrage中获取token
  const tokenstr = window.sessionStorage.getItem('token')
  if (!tokenstr) return next('/login')
  next()
})
export default router
