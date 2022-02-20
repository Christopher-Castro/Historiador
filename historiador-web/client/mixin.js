const { serverHost } = require("../config");
const request = require("request-promise-native");
const moment = require("moment");
const _ = require('lodash');

import { exportCSVFile, initDataset, generateLabels } from './utils'

export default {
  name: 'AgentMetricMixin',
  data() {
    return {
      miliseconds: 1000, // miliseconds interval
      metricLength: 18, // labels length
      lastSeconds: 20, // how many seconds of register will it bring 
      live: true,
      loaded: false,
      polling: null,
      filtered: [],
      Agents: [],
      Metrics: [],
      barMin: 0,
      barMax: 0,
      barMinValue: 0,
      barMaxValue: 0,
      dateInit: null,
      timeInit: null,
      dateFinish: null,
      timeFinish: null,
    }
  },
  async mounted(){
    await this.init()
  },
  beforeDestroy () {
    clearInterval(this.polling)
  },
  computed: {
    minDateRangeMiliseconds(){
      return moment(this.barMin).valueOf()
    },
    maxDateRangeMiliseconds(){
      return moment(this.barMax).valueOf()
    }
  },
  methods: {
    pollData () {
      const seconds = this.miliseconds
      const labels = this.liveChartData.labels
      const datasets = this.liveChartData.datasets       


      this.polling = setInterval(() => {
        const [hour, minute, second] = labels[labels.length -1].split(":")
        
        labels.shift()
        labels.push(moment().set({hour, minute, second}).add(1, 'second').format('HH:mm:ss'))

        // delete for every dataset the oldest value if before the last time
        datasets.forEach(dataset => {
          const end = moment(labels[0], "HH:mm:ss")
          if (dataset.data) {

            if (dataset.data[0]) {
              const oldest = moment(dataset.data[0].x, "HH:mm:ss")
              if (oldest.isBefore(end)){
                dataset.data.shift()
              }
            }
            
            if (dataset.data[1]) {
              const secondOld = moment(dataset.data[1].x, "HH:mm:ss")
              if (secondOld.isBefore(end)){
                dataset.data.shift()
              }
            }
            
            if (dataset.data[2]) {
              const thirdOld = moment(dataset.data[2].x, "HH:mm:ss")
              if (thirdOld.isBefore(end)){
                dataset.data.shift()
              }
            }
          }
        })


        this.liveChartData = {
          datasets,
          labels
        }
      }, seconds)
    },
    async init () {
      this.loaded = false
      try {
      
        const agents = await this.getAgents()
        const datasets = this.liveChartData.datasets       
  
        this.Metrics = await Promise.all(
          agents.map(async agent => {
            const { uuid } = agent
            const metrics = await this.getMetrics(agent)

            const results = await Promise.all(metrics.map(async metric => {
              const { type } = metric
              const dateInit = moment().subtract(this.lastSeconds - 1,'seconds').format()
              const dateFinish = moment().add(1, 'seconds').format()

              const lasts = await this.getFilteredData(uuid, type, dateInit, dateFinish)
              const labelName = `${uuid}#${type}` 
              // dont remove this line below, labelName is changed by lineColor
              const label = labelName
              let data = []
              if (lasts) {
                data = lasts.map(metric => {
                  const { value: data, createdAt: timestamp } = metric
                  // newLabels.add(moment(timestamp).format())
                  return { y: data, x: moment(timestamp).format('HH:mm:ss')}
                })
              }

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
        // const sortedLabels = Array.from(newLabels).sort((a,b) => new Date(a) - new Date(b)).map(date => moment(date).format('HH:mm:ss'))
        // get last {metricLength} seconds
        let labels = []

        for(var i = this.metricLength + 1; i >= 0; i-- ){
          labels.push(moment().subtract(i,'seconds').format('HH:mm:ss'))
        }
        this.liveChartData = {
          labels,
          datasets
        }
        this.pollData()
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
    async getFilteredData(uuid, type, dateInit, dateFinish, updateBar = true){
      try {
        if (updateBar) {
          this.barMax = moment(dateFinish).valueOf();
          this.barMin = moment(dateInit).valueOf();

          this.barMaxValue = moment(dateFinish).valueOf();
          this.barMinValue = moment(dateInit).valueOf();
        }

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
      this.socket.on('agent/message', payload => {
          const { agent: { uuid }, timestamp, metrics } = payload
          const datasets = this.liveChartData.datasets
          const labels = this.liveChartData.labels           
          
          // Add new elements
          metrics.map(m => {
            const { type: label, value: data } = m
            const labelName = `${uuid}#${label}` 
            const hidden = !this.filtered.includes(labelName)

            const found = datasets.filter(dataset => dataset.label == labelName)
            
            if(found && found[0]) {
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

          // this.liveChartData = {
          //   datasets,
          //   labels
          // }
      })
    },
    async filterChart(dateFirst, dateLast, keepLabels = false, updateLabels = false) {
      const { liveChartData: { datasets } } = this
    
      let newDatasets = []
      this.live = false // set filter mode
      this.modo = 'Históricos'
      try {
        let dataCollected = await Promise.all(datasets.map(async dataset => {
          const { label } = dataset
          const [uuid, typeMetric] = label.split('#')
          let res = await this.getFilteredData(uuid, typeMetric, dateFirst, dateLast, !keepLabels)
          if (!res){
            this.success.push({ message: `No se encontraron datos para la métrica: ${typeMetric}`})
          }
          return {res, label}
        }))
        // debugger

        // generate dates
        // given the first and last date, generate only twenty the labels
        const labelQuantity = 20;
        const labels = generateLabels(dateFirst, dateLast, labelQuantity)

        dataCollected.map(metrics => {
          const { label, res } = metrics;
          let data = [];
          
          if (res) {
            res.map(metric => {
              if (metric.value && metric.createdAt && moment(metric.createdAt)) {
                  data.push({y: metric.value, x: moment(metric.createdAt).format('DD-MM-YYYY HH:mm:ss')})
              }
            })
            // debugger
            const hidden = !this.filtered.includes(label)
            const newDataset = initDataset(label, data, hidden) 
  
            if (String(label).includes('bool')){
              newDataset.steppedLine = true
              newDataset.fill = true
              newDataset.yAxisID = 'boolean-axis'
            }
  
            newDatasets.push(newDataset)
          }
          
        })
        if (updateLabels) {
          this.filteredChartData = {
            labels,
            datasets: newDatasets
          }
        } else {
          this.filteredChartData = {
            ...this.filteredChartData,
            datasets: newDatasets
          }
        }
      } catch (error) {
        console.error('no se pudo obtener la data', error)
      }
    },
    toggleLiveMode(){
      this.modo = 'Live'
      return this.live = true
    },
    exportCsv(){
      const { filteredChartData: { datasets } } = this
      const filteredDatasets = datasets.filter(({ hidden }) => !hidden)
      const csvData = filteredDatasets.map(({ label, data }) => {
        return data.map(({ x , y }) => { 
          return { metrica: label, tiempo: x, valor: y}
        })
      }).flat()

      exportCSVFile({
        metrica: 'Metrica',
        tiempo: 'Tiempo',
        valor: 'Valor'
      }, csvData , 'Metrica')
    },
    generateDate(date_){
      const t = new Date(date_);
      t.setHours( t.getHours() + 5 );
      const date = ('0' + t.getDate()).slice(-2);
      const month = ('0' + (t.getMonth() + 1)).slice(-2);
      const year = t.getFullYear();
      const hours = ('0' + t.getHours()).slice(-2);
      const minutes = ('0' + t.getMinutes()).slice(-2);
      const seconds = ('0' + t.getSeconds()).slice(-2);
      const miliSeconds = ('00' + t.getMilliseconds()).slice(-3);
      const time = `${year}-${month}-${date}T${hours}:${minutes}:${seconds}.${miliSeconds}Z`;
      return time
    },
    updateValues(e) {
      this.barMinValue = e.minValue;
      this.barMaxValue = e.maxValue;
      this.makeRequest({
        barMinValue: e.minValue,
        barMaxValue: e.maxValue,
        _ref: this
      })
    },
    makeRequest: _.debounce(({barMinValue, barMaxValue, _ref}) => {
      try {
        const [dateInit, timeInit] = moment(barMinValue).format('YYYY-MM-DDTHH:mm:ss').split('T')
        const [dateFinish, timeFinish] = moment(barMaxValue).format('YYYY-MM-DDTHH:mm:ss').split('T')

        if (!moment(`${dateInit}T${timeInit}`).isValid()) throw new Error('Invalid date 1')
        if (!moment(`${dateFinish}T${timeFinish}`).isValid()) throw new Error('Invalid date 2')

        _ref.filterChart(
          moment(`${dateInit}T${timeInit}`),
          moment(`${dateFinish}T${timeFinish}`),
          true,
          true
        )
      } catch (error) {
        console.error(error)
      }
    }, 1000),
  },
}
