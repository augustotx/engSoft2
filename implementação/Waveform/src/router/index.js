import { createRouter, createWebHistory } from "vue-router"
import CatalogView from "../views/CatalogView.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "catalog",
      component: CatalogView
    }
  ]
})

export default router