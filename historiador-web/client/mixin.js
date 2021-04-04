const { serverHost } = require("../config");
const request = require("request-promise-native");
const moment = require("moment");

import { initDataset } from './utils'

export default {
  name: 'AgentMetricMixin',
  data() {
    return {
      miliseconds: 1000, // miliseconds interval
      metricLength: 40, // labels length
      lastSeconds: 20, // how many seconds of register will it bring 
      live: true,
      loaded: false,
      polling: null,
      filtered: [],
      Agents: [],
      Metrics: []
    }
  },
  async mounted(){
    await this.init()
  },
  beforeDestroy () {
    clearInterval(this.polling)
  },
  methods: {
    pollData () {
      const seconds = this.miliseconds
      this.polling = setInterval(() => {
        const labels = this.liveChartData.labels
        const datasets = this.liveChartData.datasets          
        const newLabels = []
        if ( labels.length >= this.metricLength) {
          labels.shift()
        }
        
        // get last {metricLength} seconds
        for(var i = this.metricLength + 1; i > 0; i-- ){
          newLabels.push(moment().subtract('seconds', i).format('HH:mm:ss'))
        }

        this.liveChartData = {
          labels: newLabels,
          datasets
        }
      }, seconds)
    },
    async init () {
      this.loaded = false
      try {
      
        const agents = await this.getAgents()
        const datasets = this.liveChartData.datasets       
  
        let newLabels = new Set()
        this.Metrics = await Promise.all(
          agents.map(async agent => {
            const { uuid } = agent
            const metrics = await this.getMetrics(agent)

            const results = await Promise.all(metrics.map(async metric => {
              const { type } = metric
              const dateInit = moment().subtract(this.lastSeconds,'seconds').format()
              const dateFinish = moment().format()

              const lasts = await this.getFilteredData(uuid, type, dateInit, dateFinish)
              const labelName = `${uuid}#${type}` 
              // dont remove this line below, labelName is changed by lineColor
              const label = labelName
              const data = lasts.map(metric => {
                const { value: data, createdAt: timestamp } = metric
                newLabels.add(moment(timestamp).format())
                return { y: data, x: moment(timestamp).format('HH:mm:ss')}
              })

              const newDataset = initDataset(label, data)
              // check if type contains boolean
              if (String(type).includes('bool')){
                newDataset.steppedLine = true
                newDataset.fill = true
                newDataset.yAxisID = 'boolean-axis'
              }

              datasets.push(newDataset)
            }))
            // get lasts values
            this.Agents.push({
              ...agent,
              metrics
            })
          })
        )
        this.loaded = true
        const sortedLabels = Array.from(newLabels).sort((a,b) => new Date(a) - new Date(b)).map(date => moment(date).format('HH:mm:ss'))

        this.liveChartData = {
          labels: sortedLabels,
          datasets
        }

        this.startRealtime()
      } catch (error) {
        console.error('no se pudo traer la data', error)
        this.Agents = []
      }

    },
    async getAgents () {
      const options = {
        method: 'GET',
        url: `${serverHost}/agents`,
        json: true
      }
      const result = await request(options)
      return result

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
    startRealtime() {
      this.pollData()
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
              if (found[0].data.length >= this.metricLength / 2) {
                found[0].data.shift()
              }
              found[0].hidden = hidden
              found[0].data.push({ y: data, x: moment(timestamp).format('HH:mm:ss')})
            } else {
              
              const firstData = [{ y: data, x: moment(timestamp).format('HH:mm:ss')}] 
              const newDataset = initDataset(labelName, firstData)

              if (String(labelName).includes('bool')){
                newDataset.steppedLine = true
                newDataset.fill = true
                newDataset.yAxisID = 'boolean-axis'
              }
              datasets.push(newDataset)
            }
          })

          this.liveChartData = {
            labels,
            datasets
          }
      })
    },
    async filterChart(){
      const { dateInit, timeInit, dateFinish, timeFinish, liveChartData: { datasets } } = this

      const dateFirst = moment(`${dateInit}T${timeInit}`).format()
      const dateLast = moment(`${dateFinish}T${timeFinish}`).format()
      
      let newLabels = new Set()
      let newDatasets = []
      this.live = false // set filter mode
      try {
        let dataCollected = await Promise.all(datasets.map(async dataset => {
          const { label } = dataset
          const [uuid, typeMetric] = label.split('#')
          let res = await this.getFilteredData(uuid, typeMetric, dateFirst, dateLast)
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
          const newDataset = initDataset(label, data, hidden) 

          if (String(label).includes('bool')){
            newDataset.steppedLine = true
            newDataset.fill = true
            newDataset.yAxisID = 'boolean-axis'
          }

          newDatasets.push(newDataset)
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
