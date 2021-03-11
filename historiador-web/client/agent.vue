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
          <div class="main-container">
            <input
              type="color"
              id="primary_color"
              class="field-radio"
              :placeholder="`${uuid}#${metric.type}`"
              :value="`${colorFromName(`${uuid}#${metric.type}`)}`"
              @input="emitColor"
            />
            <span class="container" id="color_val"></span>
          </div>
          <span>{{metric.type}}</span>
          <label class="switch">
            <input
              type="checkbox"
              :name="metric.type" :value="`${uuid}#${metric.type}`"
              @change="emitChange"
            >
            <span class="slider round"></span>
          </label>

        </li>
      </ul>
    </div>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<script>
const request = require('request-promise-native')
const { serverHost } = require('../config')
import { colorFromName } from './utils'

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
      colorFromName: null,
    }
  },
  mounted() {
    this.initialize()
    this.colorFromName = colorFromName
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
    },
    emitColor(e){
      const { target: { value: newColor, placeholder: label } } = e
      this.$root.$emit('changeColor', { newColor, label } )
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
    margin: 5px 0 5px 0;
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

/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 35px;
  height: 18px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 1px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(15px);
  -ms-transform: translateX(15px);
  transform: translateX(15px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.main-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

#primary_color{
    border-radius: 100%;
    height: 16px;
    width: 16px;
    border: none;
    outline: none;
    -webkit-appearance: none;
}

#primary_color::-webkit-color-swatch-wrapper {
    padding: 0;	
}
#primary_color::-webkit-color-swatch {
    border: none;
    border-radius: 100%;
}

  @media screen and (min-width: 850px) {
    .agent {
      padding: 15px 30px;
      margin: 24px auto;
    }
  }
</style>
