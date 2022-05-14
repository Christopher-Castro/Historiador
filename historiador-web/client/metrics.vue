<template>
  <div class="wrapper">
    <div>
      <h1>Visualización de datos en modo: {{ modo }}</h1>
    </div>
    <div class="alert-warning" v-for="({ message }, index) in success" :key="index" >
      <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
      {{ message }}
    </div>
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
        <div >
          <div class="range-picker" v-if="!live">
            <label class="label" for="range">Rango de tiempo:</label>
              <MultiRangeSlider
                :min="minDateRangeMiliseconds"
                :max="maxDateRangeMiliseconds"
                :minValue="barMinValue"
                :maxValue="barMaxValue"
                :labels="false"
                :ruler="false"
                :step="1000"
                @input="updateValues"
              />
          </div>
        </div>
        <div class="date-picker">
          <div class="choose-dates">
            <label class="label" for="dateInitIn">Fecha de inicio:</label>
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
            <label class="label" for="dateFinishIn">Fecha fin:</label>
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
          </div>
          <div>
            <button
              class="button buttonFilter"
              type="submit"
              @click="handleApplyFilter"
              :disabled="!loaded"
            >
              Modo Histórico
            </button>
            <button
              v-if="!live"
              class="button buttonLive"
              type="button"
              @click="toggleLiveMode"
            >
              Modo Live
            </button>
            <button
              v-if="!live"
              class="button buttonLive"
              type="button"
              @click="exportCsv"
            >
              Exportar CSV
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const LineChart = require("./line-chart")
import MultiRangeSlider from "./MultiRange.vue"
import mixin from './mixin'
const moment = require("moment");


export default {
  name: "metrics",
  mixins: [mixin],
  props: ["agents", "metrics", "socket", "uuid"],
  components: {
    LineChart,
    MultiRangeSlider
  },
  mounted(){
    this.$root.$on('toggleMetric', this.handleMetrics)
    this.$root.$on('changeColor', this.handleColor)
    this.$root.$on('newAgent', this.handleNewAgent)
  },
  data() {
    return {
      modo: 'Live',
      success: [],
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
        tooltips: {
            callbacks: {
                title: function(context, value) {
                  return null;
                }
            }
        },
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
                type: 'linear',
              }
            ]
        }
      },
      error: null,
      color: null,
    };
  },
  methods: {
    async handleApplyFilter() {
      try {        
        this.loaded = false;
        await this.filterChart(
          `${this.dateInit}T${this.timeInit}`,
          `${this.dateFinish}T${this.timeFinish}`,
          true
        )
      } catch (error) {
        console.error(error)
      }
      this.loaded = true;
    },
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
* {
  font-family: 'Roboto', sans-serif;
}
h1 {
    padding-right: 200px;
    font-size: 20px;
  }
.dates {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  margin-top:15px;
}
.date-time {
  width: 40%;
  display: flex;
  margin: 5px 0px 5px 0px;
  justify-content: space-between;
}
.range-picker {
  width: 100%;
  padding: 0;
  margin: 0;
}
.choose-dates {
  display: flex;
  flex-direction: column;
  margin: 15px 0;
}

.choose-dates > label {
  margin: 2px 0;
}
.button {
  cursor: pointer;
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

.alert-warning {
  padding: 15px;
  background-color: #eed202; /* Red */
  color: black;
  margin-bottom: 15px;
}

.closebtn {
  margin-left: 15px;
  color: white;
  font-weight: bold;
  float: right;
  font-size: 22px;
  line-height: 20px;
  cursor: pointer;
  transition: 0.3s;
}

/* When moving the mouse over the close button */
.closebtn:hover {
  color: black;
}

.label {
  font-size: 12px;
  font-weight: bold;
}

</style>
