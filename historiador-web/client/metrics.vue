<template>
  <div class="wrapper">
    <line-chart
      v-if="loaded"
      :chart-data="chartData"
      :options="options"
      :width="400" :height="200"
    />
    <div>
      <form class="dates" v-on:submit.prevent>
        <p class="date-time">
          <label for="dateInitIn">
            <span>Fecha de inicio: </span>
          </label>
          <label for="timeInitIn">
            <input required type="date" id="dateInitIn" v-model="dateInit" />
            <input required type="time" step="1" id="timeInitIn" v-model="timeInit" />
          </label>
        </p>
        <p class="date-time">
          <label for="dateFinishIn">
            <span>Fecha fin: </span>
          </label>
          <label for="timeFinishIn">
            <input required type="date" id="dateFinishIn" v-model="dateFinish"/>
            <input required type="time" step="1" id="timeFinishIn" v-model="timeFinish" />
          </label>
        </p>
        <button type="submit" @click="filterChart">Filter</button>
      </form>
    </div>
  </div>
</template>

<script>
const LineChart = require("./line-chart");

import mixin from './mixin'

export default {
  name: "metrics",
  mixins: [mixin],
  props: ["agents", "metrics", "socket", "uuid"],
  components: {
    LineChart
  },
  mounted(){
    this.$root.$on('checkUpdate', this.handleMetrics)
  },
  data() {
    return {
      chartData: {
        labels: [],
        datasets:[]
      },
      options: {
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
    handleMetrics(payload){
      const labelNames = payload.map(agent => {
        const {uuid, metric: { type }} = agent
        return `${uuid}#${type}`   
      })
      this.filtered = labelNames
    },
    async filterChart(){
      const { dateInit, timeInit, dateFinish, timeFinish, chartData: { datasets } } = this
      const [ dateTimeInit, dateTimeFinish ] = [`${dateInit}T${timeInit}`, `${dateFinish}T${timeFinish}`]

      try {
        datasets.forEach(async dataset => {
          const { label } = dataset
          const [uuid, typeMetric] = label.split('#')
          const res = await this.getFilteredData(uuid, typeMetric, dateTimeInit, dateTimeFinish)
          console.log(res)
        })
      } catch (error) {
        console.error('no se pudo obtener la data', error)
      }
    },
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
</style>
