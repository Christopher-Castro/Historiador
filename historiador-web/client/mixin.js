const { serverHost } = require("../config");
const request = require("request-promise-native");
const moment = require("moment");

import * as Utils from './utils'

export default {
  name: 'AgentMetricMixin',
  data() {
    return {
      metricLength:30,
      live: true,
      loaded: false,
      polling: null,
      filtered: [],
      Agents: [],
      Metrics: []
    }
  },
  async mounted(){
    this.init()
    this.pollData()
  },
  beforeDestroy () {
    clearInterval(this.polling)
  },
  methods: {
    pollData () {
      const seconds = 2 * 1000 
      this.polling = setInterval(() => {
        const labels = this.liveChartData.labels
        const datasets = this.liveChartData.datasets          

        if ( labels.length >= this.metricLength) {
          labels.shift()
        }
        
        labels.push(moment().format('HH:mm:ss'))

        this.liveChartData = {
          labels,
          datasets
        }
      }, seconds)
    },
    async init () {
      this.loaded = false
      try {
      
        const agents = await this.getAgents()
  
        this.Metrics = await Promise.all(
          agents.map(async agent => {
            const metrics = await this.getMetrics(agent)
  
            this.Agents.push({
              ...agent,
              metrics
            })
          })
        )
        this.loaded = true
        this.startRealtime()
      } catch (error) {
       console.error('no se pudo traer la data', error) 
      }

    },
    async getAgents () {
      const options = {
        method: 'GET',
        url: `${serverHost}/agents`,
        json: true
      }
      try {
        const result = await request(options)
        return result
      } catch (e) {
        // this.error = e.error.error
        return e.error.error 
      }
    },
    async getMetrics(agent) {
      const { uuid } = agent
      const options = {
        method: 'GET',
        url: `${serverHost}/metrics/${uuid}`,
        json: true
      }
      try {
        const metrics = await request(options)
        return metrics
      } catch (e) {
        return e.error.error
      }
    },
    startRealtime() {
      
      this.socket.on('agent/message', payload => {
          const { agent: { uuid }, timestamp, metrics } = payload
          const labels = this.liveChartData.labels
          const datasets = this.liveChartData.datasets          
          
          // Add new elements
          metrics.map(m => {
            const { type: label, value: data } = m
            const labelName = `${uuid}#${label}` 
            const hidden = !this.filtered.includes(labelName)

            const found = datasets.filter(dataset => dataset.label == labelName)
            
            if(found && found[0]) {
              if (found[0].data.length >= this.metricLength) {
                found[0].data.shift()
              }
              found[0].hidden = hidden
              found[0].data.push({ y: data, x: moment(timestamp).format('HH:mm:ss')})
            } else {
              // dont remove this line below, labelName is changed by lineColor
              const label = labelName
              const lineColor = Utils.intToRGB(Utils.hashCode(labelName))
              const fill = false
              const hidden = true
              datasets.push({
                label,
                fill,
                hidden,
                backgroundColor: lineColor,
                borderColor: lineColor,
                data: [{ y: data, x: moment(timestamp).format('HH:mm:ss')}]
              })
            }
          })

          this.liveChartData = {
            labels,
            datasets
          }
      })
    },
    async getFilteredData(uuid, type, dateInit, dateFinish){
      try {
        const options = {
          method: 'POST',
          url: `${serverHost}/metrics/date/${uuid}/${type}`,
          body: {
            dateInit,
            dateFinish
          },
          json: true
        }
        const result = await request(options)
        return result
      } catch (e) {
        return
      } 
    },
    async filterChart(){
      const { dateInit, timeInit, dateFinish, timeFinish, liveChartData: { datasets } } = this
      const [ dateTimeInit, dateTimeFinish ] = [`${dateInit}T${timeInit}`, `${dateFinish}T${timeFinish}`]

      let newLabels = new Set()
      let newDatasets = []
      this.live = false // set filter mode
      try {
        let dataCollected = await Promise.all(datasets.map(async dataset => {
          const { label } = dataset
          const [uuid, typeMetric] = label.split('#')
          let res = await this.getFilteredData(uuid, typeMetric, dateTimeInit, dateTimeFinish)
          return {res, label}
        }))

        dataCollected.map(metrics => {
          const { label, res } = metrics;
          let data = [];
          
          res.map(metric => {
            const { createdAt, value } = metric
            newLabels.add(moment(createdAt).format())
            data.push({y: value, x: moment(createdAt).format('HH:mm:ss') })
          })
          const hidden = !this.filtered.includes(label)
          newDatasets.push({
            label,
            data,
            hidden,
            backgroundColor: Utils.intToRGB(Utils.hashCode(label)),
            borderColor: Utils.intToRGB(Utils.hashCode(label)),
            fill: false
          })
        })
        // sort dates
        const sortedLabels = Array.from(newLabels).sort((a,b) => new Date(a) - new Date(b)).map(date => moment(date).format('HH:mm:ss'))

        this.filteredChartData = {
          labels: sortedLabels,
          datasets: newDatasets
        }
      } catch (error) {
        console.error('no se pudo obtener la data', error)
      }
    },
    toggleLiveMode(){
      return this.live = true
    }
  }
}
