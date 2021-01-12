<template>
  <div class="metric">
    <p>{{dateFinish}}</p>
    <h3 class="metric-type">{{ type }}</h3>
    <line-chart
      :chart-data="datacollection"
      :options="{ responsive: true }"
      :width="400" :height="200"
    ></line-chart>
    <p v-if="error">{{error}}</p>
  </div>
</template>
<style>
  .metric {
    border: 1px solid white;
    margin: 0 auto;
  }
  .metric-type {
    font-size: 28px;
    font-weight: normal;
    font-family: 'Roboto', sans-serif;
  }
  canvas {
    margin: 0 auto;
  }
</style>
<script>
const request = require('request-promise-native')
const moment = require('moment')
const randomColor = require('random-material-color')
const LineChart = require('./line-chart')
const { serverHost } = require('../config')

module.exports = {
  name: 'histMetric',
  components: {
    LineChart
  },
  props: [ 'uuid', 'type', 'dateInit', 'dateFinish', 'convert', 'socket' ],
  data() {
    return {
      datacollection: {},
      error: null,
      color: null
    }
  },
  mounted() {
    this.initialize()
  },
  methods: {
    async initialize() {
      const { uuid, type } = this
      const { dateInit, dateFinish} = this
      this.color = randomColor.getColor()
      const options = {
        method: 'POST',
        url: `${serverHost}/metrics/date/${uuid}/${type}`,
        body: {
          dateInit,
          dateFinish
        },
        json: true
      }
      let result
      console.log(options.body)
      try {
        result = await request(options)
      } catch (e) {
        this.error = e.error.error
        return
      }
      
      const labels = []
      const data = []
      if (Array.isArray(result)) {
        result.forEach(m => {
          labels.push(moment(m.createdAt).format('HH:mm:ss'))
          data.push(m.value)
        })
      }
      this.datacollection = {
        labels,
        datasets: [{
          backgroundColor: this.color,
          label: type,
          data
        }]
      }
    },  

    handleError (err) {
      this.error = err.message
    }
  }
}
</script>