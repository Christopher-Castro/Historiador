'use strict'

const Vue = require('vue')
const App = require('./app.vue')
const Agent = require('./agent.vue')
const Metric = require('./metric.vue')
const HistMetric = require('./histMetric.vue')
const Metrics = require('./metrics.vue')

Vue.component('agent', Agent)
Vue.component('metric', Metric)
Vue.component('histMetric', HistMetric)
Vue.component('metrics', Metrics)

// eslint-disable-next-line no-unused-vars
const vm = new Vue({
  el: '#app',
  render (createElement) {
    return createElement(App)
  }
})