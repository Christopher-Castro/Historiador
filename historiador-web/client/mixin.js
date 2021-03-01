const { serverHost } = require("../config");
const request = require("request-promise-native");
const moment = require("moment");

import * as Utils from './utils'

export default {
  name: 'AgentMetricMixin',
  data() {
    return {
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
      this.polling = setInterval(() => {
        const labels = this.chartData.labels
        const datasets = this.chartData.datasets          

        if ( labels.length >= 20) {
          labels.shift()
        }
        
        labels.push(moment().format('HH:mm:ss'))

        this.liveChartData = {
          labels,
          datasets
        }
      }, 2000)
    },
    async init () {
      this.loaded = false
      try {
      
        const agents = await this.getAgents()
  
        this.Metrics = await Promise.all(
          agents.map(async agent => {
            const metrics = await this.getMetrics(agent)
            const metricsNames = metrics.map(m => m.type)
  
            metricsNames.map(name => {
              const hidden = true
              const labelName = `${agent.uuid}#${name}` 
              this.chartData.datasets.push(
                {
                  label: labelName,
                  fill: false,
                  spanGaps: false,
                  data: [],
                  backgroundColor: Utils.intToRGB(Utils.hashCode(labelName)),
                  borderColor: Utils.intToRGB(Utils.hashCode(labelName)),
                  hidden
                }
              )
            })
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
            const hidden = this.filtered.includes(labelName)

            const found = datasets.filter(dataset => dataset.label == labelName)
            
            if(found && found[0]) {
              if (found[0].data.length >= 20) {
                found[0].data.shift()
              }
              found[0].hidden = hidden
              found[0].data.push(data)
            } else {
              const arrData = [data]
              datasets.push({
                label: labelName,
                fill:false,
                hidden,
                data: arrData
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
      const { dateInit, timeInit, dateFinish, timeFinish, chartData: { datasets } } = this
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
            const date = moment(createdAt).format('HH:mm:ss')
            newLabels.add(date)
            data.push(value)
          })
          const hidden = this.filtered.includes(label)
          newDatasets.push({
            label,
            data,
            hidden,
            spanGaps: true,
            backgroundColor: Utils.intToRGB(Utils.hashCode(label)),
            borderColor: Utils.intToRGB(Utils.hashCode(label)),
            fill: false
          })
        })

        this.filteredChartData = {
          labels: [...newLabels],
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
