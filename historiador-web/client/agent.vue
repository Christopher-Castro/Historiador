<template>
  <div class="agent">
    <div>
      <b class="agent-title">{{name}} ({{pid}})</b>
      <p class="agent-host">{{hostname}}</p>
      <p class="agent-status">Connected: <span>{{connected}}</span></p>
      <ul style="padding:0">
        <li class="labels">
          <b>Nombre</b>
          <b style="margin-left:30px">Mostrar?</b>
        </li>
      </ul>
      <ul style="padding:0;">
        <li class="list-item" v-for="metric in metrics" :key="metric.type">
          <span class="box" :style="`background-color: ${Utils.intToRGB(Utils.hashCode(`${uuid}#${metric.type}`))}`"></span>
          <span>{{metric.type}}</span>
          <input
            type="checkbox"
            :name="metric.type" :value="`${uuid}#${metric.type}`"
            @change="emitChange"
          />
        </li>
      </ul>
    </div>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<script>
const request = require('request-promise-native')
const { serverHost } = require('../config')
const utils = require('./utils')

module.exports = {
  props: [ 'uuid', 'socket' ],
  data() {
    return {
      name: null,
      hostname: null,
      connected: false,
      pid: null,
      showMetrics: false,
      showHistMetrics: false,
      error: null,
      metrics: [],
      histMetrics: [],
      checkedMetrics:[],
      timeFinishIn: null,
      dateFinishIn: null,
      dateFinish: null,
      timeInitIn: null,
      dateInitIn: null,
      dateInit: null,
      convert: false,
      Utils: null,
    }
  },
  mounted() {
    this.initialize()
    this.Utils = utils
  },
  methods: {
    async initialize() {
      const { uuid } = this
      const options = {
        method: 'GET',
        url: `${serverHost}/agent/${uuid}`,
        json: true
      }
      let agent
      try {
        agent = await request(options)
      } catch (e) {
        this.error = e.error.error
        return
      }
      this.name = agent.name
      this.hostname = agent.hostname
      this.connected = agent.connected
      this.pid = agent.pid
      this.loadMetrics()
    },
    async loadMetrics () {
      const { uuid } = this
      const options = {
        method: 'GET',
        url: `${serverHost}/metrics/${uuid}`,
        json: true
      }
      let metrics
      try {
        metrics = await request(options)
      } catch (e) {
        this.error = e.error.error
        return
      }
      this.metrics = metrics
      this.startRealtime()
    },
    startRealtime () {
      const { uuid, socket } = this
      socket.on('agent/disconnected', payload => {
        if (payload.agent.uuid === uuid) {
          this.connected = false
        }
      })
    },
    toggleMetrics() {
      this.showMetrics = this.showMetrics ? false : true
      this.showHistMetrics = false
    },
    toggleHistMetrics() {
      this.showHistMetrics = this.showHistMetrics ? false : true
      this.showMetrics = false
    },
    convertDate () {
      
      if (!dateInitIn || !timeInitIn || !dateFinishIn || !timeFinishIn) {
         this.dateInit= null
         this.dateFinish= null
      } else {
        this.dateInit= `${this.dateInitIn} ${this.timeInitIn}`
        this.dateFinish= `${this.dateFinishIn} ${this.timeFinishIn}`
        this.convert = true
      }
    },
    emitChange(e){
      const { target: { value } } = e
      this.$root.$emit('toggleMetric', value)
    }
  }
}
</script>


<style>
  ul{
    margin: 16px 0px 0px 0px
  }
  .labels {
    display: flex;
    justify-content: space-between;
  }
  .list-item{
    display: grid;
    grid-template-columns: 0.1fr 0.8fr  0.1fr ;
  }
  .metrics-title {
    text-align: center;
    font-size: 14px;
    letter-spacing: 1px;
    font-family: 'Monserrat', sans-serif;
  }
  .button {
    text-transform: uppercase;
    color: #ff7a22;
    border: none;
    background: none;
    font-size: 14px;
    font-weight: 900;
    cursor: pointer;
    outline: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
  }
  .agent {
    max-width: 850px;
    min-width: 300px;
    box-sizing: border-box;
    border-radius: 4px;
    background: white;
    padding: 20px;
    font-family: 'Roboto', sans-serif;
    margin: 24px 15px;
    box-shadow: 0 1px 3px 0 rgba(165, 165, 165, 0.2), 0 2px 2px 0 rgba(163, 137, 137, 0.12), 0 0 2px 0 rgba(0, 0, 0, 0.14);
  }
  .agent-title {
    font-size: 16px;
    letter-spacing: 1px;
    margin: 0;
    font-family: 'Monserrat', sans-serif;
  }
  .agent-host {
    font-size: 14px;
  }
  .agent-status {
    font-size: 14px
  }
  .agent-status span {
    font-weight: bold;
    color: #ff7a22;
  }
  .box {
    margin: 3px 3px 3px 4px;
    width: 13px;
    height: 13px;
  }
  @media screen and (min-width: 850px) {
    .agent {
      padding: 15px 30px;
      margin: 24px auto;
    }
  }
</style>
