import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginForm from '../components/LoginForm.vue'
import LoginView from '../views/LoginView.vue'
import Navigation from '../components/Navigation.vue'
import HelloWorld from '../components/HelloWorld.vue'
import ReservacionesView from '../views/ReservacionesView.vue'

const routes = [
  {
    path: '/home',
    name: 'home',
    components: {
      default: HomeView,
    }
  },
  {
    path: '/login',
    name: 'login',
    components: {
      default: LoginView,
    }
  },
  {
    path: '/reservation',
    name: 'reservation',
    components: {
      default: ReservacionesView,
    }
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
