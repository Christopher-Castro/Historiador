<template>
  <div class="wrapper">
    <line-chart
      v-if="loaded"
      :chart-data="live ? liveChartData : filteredChartData"
      :options="options"
      :width="400"
      :height="200"
    />
    <div>
      <form class="dates" v-on:submit.prevent>
        <p class="date-time">
          <label for="dateInitIn">
            <span>Fecha de inicio: </span>
          </label>
          <label for="timeInitIn">
            <input required type="date" id="dateInitIn" v-model="dateInit" />
            <input
              required
              type="time"
              step="1"
              id="timeInitIn"
              v-model="timeInit"
            />
          </label>
        </p>
        <p class="date-time">
          <label for="dateFinishIn">
            <span>Fecha fin: </span>
          </label>
          <label for="timeFinishIn">
            <input
              required
              type="date"
              id="dateFinishIn"
              v-model="dateFinish"
            />
            <input
              required
              type="time"
              step="1"
              id="timeFinishIn"
              v-model="timeFinish"
            />
          </label>
        </p>
        <div>
          <button class="buttonFilter" type="submit" @click="filterChart">
            Filtrar
          </button>
          <button
            v-if="!live"
            class="buttonLive"
            type="button"
            @click="toggleLiveMode"
          >
            Modo Live
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const LineChart = require("./line-chart")
const moment = require('moment')

import mixin from './mixin'

export default {
  name: "metrics",
  mixins: [mixin],
  props: ["agents", "metrics", "socket", "uuid"],
  components: {
    LineChart
  },
  mounted(){
    this.$root.$on('toggleMetric', this.handleMetrics)
    this.$root.$on('newAgent', this.handleNewAgent)
  },
  data() {
    return {
      liveChartData: {
        labels: [],
        datasets:[]
      },
      filteredChartData: {
        labels: [],
        datasets:[]
      },
      chartData: {
        labels: [],
        datasets:[]
      },
      options: {
        legend: {
          display: false
        },
        responsive: true,
        scales: {
          x: { display: true },
          y: { display: true }
        }
      },
      dateInit: null,
      timeInit: null,
      dateFinish: null,
      timeFinish: null,
      error: null,
      color: null,
    };
  },
  methods: {
    handleMetrics(label){
      // TODO do it more declarative less imperative 
      // search if it is present 
      const index = this.filtered.indexOf(label)
      if (index > -1) {
        this.filtered.splice(index, 1);
      } else {
        this.filtered.push(label)
      }
      
    },
    async handleNewAgent(payload){
      const { uuid } = payload
      const metrics = await this.getMetrics(payload)
      const metricsNames = metrics.map(m => m.type)

      metricsNames.map(name => {
        const hidden = false
        const labelName = `${uuid}#${name}` 
        this.liveChartData.datasets.push(
          {
            label: labelName,
            fill: false,
            spanGaps: false,
            data: [],
            backgroundColor: this.intToRGB(this.hashCode(labelName)),
            borderColor: this.intToRGB(this.hashCode(labelName)),
            hidden
          }
        )
      })
    }
  },
  computed: {
    
  }
};
</script>

<style>
.dates {
  display: grid;
}
.date-time {
  width: 40%;
  display: flex;
  margin: 5px 0px 5px 0px;
  justify-content: space-between;
}

.buttonFilter {
  width: 200px;
  border-radius: 4px;
  border: none;
  color: white;
  font-size: 14px;
  background-color: blue;
  padding: 5px 5px;
}

.buttonLive {
  width: 200px;
  border-radius: 4px;
  border: 1px solid blue;
  color: blue;
  font-size: 14px;
  background-color: white;
  padding: 5px 5px;
}
</style>
