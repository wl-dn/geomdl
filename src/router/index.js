/*
 * @Descripttion: 
 * @Author: wenlong
 * @version: 
 * @Date: 2021-05-20 16:35:09
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-12-04 13:47:28
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../view/Home.vue'
import HelloCesium from '../view/CesiumStandBox/HelloCesium'
import CesiumWedgit from '../view/CesiumStandBox/CesiumWedgit.vue'
import Geo3DTiles from "../view/3DTiles/geo3DTiles.vue"
import BIM3DTiles from "../view/3DTiles/3DTilesBim.vue"
import scene from "../view/3DTiles/geoMdl.vue"
import drawEntity from "../view/3DTiles/drawEntity.vue"
import digTerrian from "../view/3DTiles/digTerrian.vue"
import MdlClip from "../view/3DTiles/3DTilesClip.vue"
import load3DTilesByThree from "../view/Three/load3DTilesByThree.vue"
import threeClip3DTiles from "../view/Three/threeClip3DTiles.vue"
import mdlScene from "../view/Three/threeMdl.vue"
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'scene',
    component: scene,
    // redirect: "/scene",
    children: [
      {
        path: "/helloCesium",
        component: HelloCesium
      },
      {
        path: "/CesiumWedgit",
        component: CesiumWedgit
      },
      {
        path: "/Geo3DTiles",
        component: Geo3DTiles
      },
      {
        path: "/BIM3DTiles",
        component: BIM3DTiles
      },
      {
        path: "/scene",
        component: scene
      },
      {
        path: "/drawEntity",
        component: drawEntity
      },
      {
        path: "/digTerrian",
        component: digTerrian
      },
      {
        path: "/3DTilesClip",
        component: MdlClip
      },
      {
        path: "/load3DTilesByThree",
        component: load3DTilesByThree
      },
      {
        path: "/threeClip3DTiles",
        component: threeClip3DTiles
      },
    ]

  },
  {
    path: "/mdlScene",
    component: mdlScene
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  // mode: 'history',
  // base: "/crccgeo/",
  routes
})

export default router
