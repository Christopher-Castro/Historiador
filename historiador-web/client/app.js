'use strict'

const Vue = require('vue')
const VueRouter = require('vue-router')
const App = require('./app.vue')
const Agent = require('./agent.vue')
const Metric = require('./metric.vue')
const HistMetric = require('./histMetric.vue')
const Metrics = require('./metrics.vue')
const Panel = require('./newAgent.vue')
const Layout = require('./Layout.vue')

Vue.component('agent', Agent)
Vue.component('metric', Metric)
Vue.component('histMetric', HistMetric)
Vue.component('metrics', Metrics)
Vue.component('App', App)
Vue.component('Panel', Panel)
// eslint-disable-next-line no-unused-vars
Vue.use(VueRouter)

const routes = [
  { path: '/panel', component: Panel },
  { path: '/', component: App },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

const vm = new Vue({
  el: '#app', router, render: h => h(Layout) 
})