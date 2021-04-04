'use strict'

const Vue = require('vue')
const VueRouter = require('vue-router')
const App = require('./app.vue')
const Agent = require('./agent.vue')
const Metric = require('./metric.vue')
const Metrics = require('./metrics.vue')
const Layout = require('./Layout.vue')

Vue.component('agent', Agent)
Vue.component('metric', Metric)
Vue.component('metrics', Metrics)
Vue.component('App', App)

Vue.use(VueRouter)

const routes = [
  { path: '/', component: App },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

const vm = new Vue({
  el: '#app', router, render: h => h(Layout) 
})