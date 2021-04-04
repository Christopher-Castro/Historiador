'use strict'

const Vue = require('vue')
const VueRouter = require('vue-router')
const Panel = require('./newAgent.vue')
const Layout = require('./Layout.vue')

Vue.component('Panel', Panel)
// eslint-disable-next-line no-unused-vars
Vue.use(VueRouter)

const routes = [
  { path: '/', component: Panel }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

const vm = new Vue({
  el: '#app', router, render: h => h(Layout) 
})