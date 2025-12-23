import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CreateLobby from '../views/CreateLobby.vue'
import JoinLobby from '../views/JoinLobby.vue'
import GameView from '../views/GameView.vue'
import Backoffice from '../views/Backoffice.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/create', name: 'create', component: CreateLobby },
    { path: '/join', name: 'join', component: JoinLobby },
    { path: '/game', name: 'game', component: GameView },
    { path: '/backoffice', name: 'backoffice', component: Backoffice },
  ]
})

export default router