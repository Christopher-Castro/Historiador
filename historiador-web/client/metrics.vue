<template>
  <div class="wrapper">
    <div class="chart-wrapper" style="overflow-x: auto;">
      <line-chart
        v-if="loaded"
        :chart-data="live ? liveChartData : filteredChartData"
        :options="options"
        :width="400"
        :height="200"
      />
    </div>
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
          <button
            v-if="!live"
            class="buttonLive"
            type="button"
            @click="exportCsv"
          >
            Exportar CSV
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const LineChart = require("./line-chart")

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
    this.$root.$on('changeColor', this.handleColor)
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
        animation: {
          duration: 400
        },
        scales: {
            yAxes: [
              {
                id: 'boolean-axis',
                type: 'linear',
                display: false,
                ticks: {
                  stepSize: 1,
                  suggestedMin: 0,
                  suggestedMax: 1,
                  min: 0,
                  max: 1
                }
              },
              {
                id: 'normal-axis',
                type: 'linear'
              }
            ]
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
      let hide = false
      // for live mode search if it is present 
      const index = this.filtered.indexOf(label)
      if (index > -1) {
        this.filtered.splice(index, 1);
        hide = true
      } else {
        this.filtered.push(label)
        hide = false
      }

      // for filtered mode

      const labels = this.filteredChartData.labels
      const datasets = this.filteredChartData.datasets     
      const hidden = hide

      const found = datasets.filter(dataset => dataset.label == label)
              
      if(found && found[0]) {
        found[0].hidden = hidden
      } 

      this.filteredChartData = {
        labels,
        datasets
      }
      
    },
    async handleNewAgent(payload){
      const { uuid } = payload
      const metrics = await this.getMetrics({ uuid })
      const metricsNames = metrics.map(m => m.type)

    },
    handleColor({ newColor, label }){
      //  filter
      const {labels, datasets} = this.filteredChartData
      //  live
      const {labels: labelsLive, datasets: datasetsLive} = this.liveChartData

      const found = datasets.filter(dataset => dataset.label == label)
      const foundLive = datasetsLive.filter(dataset => dataset.label == label)

      if(found && found[0]) {
        found[0].backgroundColor = newColor
        found[0].borderColor = newColor

        this.filteredChartData = {
          labels,
          datasets
        }
      }

      if(foundLive && foundLive[0]) {
        foundLive[0].backgroundColor = newColor
        foundLive[0].borderColor = newColor

        this.liveChartData = {
          labels: labelsLive,
          datasets: datasetsLive
        }
      }
    }
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
