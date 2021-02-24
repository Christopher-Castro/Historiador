const { serverHost } = require("../config");
const request = require("request-promise-native");
const moment = require("moment");


export default {
  name: 'AgentMetricMixin',
  data() {
    return {
      loaded: false,
      filtered: [],
      Agents: [],
      Metrics: []
    }
  },
  async mounted(){
    this.init()
  },
  methods: {
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
                  data: [],
                  backgroundColor: this.intToRGB(this.hashCode(labelName)),
                  borderColor: this.intToRGB(this.hashCode(labelName)),
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
          const labels = this.chartData.labels
          const datasets = this.chartData.datasets          

          if ( labels.length >= 20) {
            labels.shift()
          }
          
          labels.push(moment(timestamp).format('HH:mm:ss'))
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
              data.push({
                label: labelName,
                fill:false,
                hidden,
                data
              })
            }
          })

          this.chartData = {
            labels,
            datasets
          }
      })
    },
    async getFilteredData(uuid, type, dateInit, dateFinish){
      const options = {
        method: 'POST',
        url: `${serverHost}/metrics/date/${uuid}/${type}`,
        body: {
          dateInit,
          dateFinish
        },
        json: true
      }
      try {
        result = await request(options)
      } catch (e) {
        return
      } 
    },

    hashCode(str) { // java String#hashCode
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
         hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
    },
    intToRGB(i){
      var c = (i & 0x00FFFFFF)
          .toString(16)
          .toUpperCase();
  
     return "#" + "00000".substring(0, 6 - c.length) + c;
    },
    search(nameKey, myArray){
      for (var i=0; i < myArray.length; i++) {
          if (myArray[i].name === nameKey) {
              return myArray[i];
          }
      }
    }
  }
}
