<template>
  <div class="agent">
    <div>
      <b class="agent-title">{{name}} ({{pid}})</b>
      <p class="agent-host">{{hostname}}</p>
      <p class="agent-status">Connected: <span>{{connected}}</span></p>
      <ul style="padding:0">
        <li class="list-item">
          <b>Nombre</b>
          <b>Color</b>
          <b>Ocultar?</b>
        </li>
      </ul>
      <ul style="padding:0;">
        <li class="list-item" v-for="metric in metrics" :key="metric.type">
          <span>{{metric.type}}</span>
          <span>Color</span>
          <input
            type="checkbox"
            :name="metric.type" :value="{
              metric,
              name,
              pid,
              hostname,
              uuid
            }"
            v-model="checkedMetrics"
          />
        </li>
      </ul>
      <!-- <button v-on:click="toggleMetrics" class="button">Toggle Metrics</button>
      <button v-on:click="toggleHistMetrics" class="button">Toggle Historical Metrics</button>
      <p v-show="showHistMetrics">
        <button v-on:click="convertDate" class="button">Consultar</button>
      </p>
      <div v-show="showMetrics">
        <h3 class="metrics-title">Metrics</h3>
        <metric
          :uuid="uuid"
          :socket="socket"
          v-for="metric in metrics"
          v-bind:type="metric.type"
          v-bind:key="metric.type"
        ></metric>

      </div>
      <div v-show="showHistMetrics">
        <form>
          <p>
            <label for="dateInitIn">
              <span>Fecha de inicio: </span>
              <input type="date" id="dateInitIn" v-model="dateInitIn" />
            </label>
            <label for="timeInitIn">
              <input type="time" step="1" id="timeInitIn" v-model="timeInitIn" />
            </label>
          </p>
          <span>{{ dateInit }} </span>
          <p>
            <label for="dateFinishIn">
              <span>Fecha fin: </span>
              <input type="date" id="dateFinishIn" v-model="dateFinishIn"/>
            </label>
            <label for="timeFinishIn">
              <input type="time" step="1" id="timeFinishIn" v-model="timeFinishIn" />
            </label>
          </p>
          <span>{{ dateFinish }} </span>
        </form>
        <div v-if="dateInit !== null">
          <h3 class="metrics-title">Historical Metrics</h3>
          <histMetric
            :uuid="uuid"
            v-bind:dateInit="dateInit"
            v-bind:dateFinish="dateFinish"
            v-bind:convert="convert" 
            :socket="socket"
            v-for="metric in metrics"
            v-bind:type="metric.type"
            v-bind:key="metric.type"
          ></histMetric>
        </div>
        
      </div> -->
    </div>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<script>
const request = require('request-promise-native')
const { serverHost } = require('../config')

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
      convert: false
    }
  },
  mounted() {
    this.initialize()
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
    }
  },
  watch: {
    checkedMetrics: function() {
      this.$root.$emit('checkUpdate', this.checkedMetrics)
    }
  }
}
</script>


<style>
  ul{
    margin: 16px 0px 0px 0px
  }
  .list-item{
    display: grid;
    grid-template-columns: 0.8fr 0.1fr 0.1fr ;
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
  @media screen and (min-width: 850px) {
    .agent {
      padding: 15px 50px;
      margin: 24px auto;
    }
  }
</style>
