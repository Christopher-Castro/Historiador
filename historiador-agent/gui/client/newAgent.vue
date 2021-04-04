<template>
    <form class="wrapper" @submit="checkForm">
        <h1>Panel de creación de módulo</h1>
        <div class="alert-success" v-if="success && success.length">
          <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
          {{success}}
        </div>
        <div class="alert" v-if="errors.length">
          <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
          <li v-for="(error, index) in errors" :key="index">{{error}}</li>
        </div>


        <div class="formNewIp">
          <b class="title-bold">IP de la máquina</b>
          <input placeholder="IP de la máquina" type="text" name="ip" v-model="ip">

          <b class="title-bold">Intervalo de muestreo</b>
          <input placeholder="Intervalo de muestreo" type="number" min="1" name="interval" v-model="interval">
          <select name="time-range-interval" v-model="intervalType">
            <option value="seconds">Segundos</option>
            <option value="minutes">Minutos</option>
            <option value="hours">Horas</option>
            <option value="days">Dias</option>
          </select>

          <b class="title-bold">Duración de la toma de datos</b>
          <input placeholder="Duración de la toma de datos" type="number" min="1" name="deadline" v-model="deadline">
          <select name="time-range-deadline" v-model="deadlineType">
            <option value="seconds">Segundos</option>
            <option value="minutes">Minutos</option>
            <option value="hours">Horas</option>
            <option value="days">Dias</option>
          </select>

          <button type="button" class="buttonLive" @click="newAgentRow()">Agregar Agente</button>

          <div class="agents-cards">
            <div class="agent-each" v-for="({ metrics },_index) in agents" :key="_index">
              <h3>Agente #{{_index}}</h3>
              <div class="metric-each" v-for="(metric, index) in metrics" :key="index">
                <b class="metric-name-title">{{`Nombre de la métrica #${index}`}}</b>
                <input :placeholder="`Nombre de la métrica #${index}`" type="text" v-model="metric.name" id="metric-name">
                
                <b class="metric-type-title">Tipo de métrica</b>
                
                <label for="metric-type">Analógico</label>
                <input type="radio" id="metric-type" value="analogic" v-model="metric.type" />
                
                <label for="metric-type">Digital</label>
                <input type="radio" id="metric-type" value="digital" v-model="metric.type" />             
              </div>
              
              <button type="button" class="buttonFilter" @click="newMetricRow(_index)">Agregar Métrica</button>
            </div>
          </div>

          
        </div>

        <button class="buttonSubmit" type="submit">Agregar Módulo</button>
        <!-- <div class="ips" v-for="({ip, interval, deadline, agents}, index) in ips" :key="index">
          <label for="ip">{{ip}}</label>
          <label for="interval">{{interval}}</label>
          <label for="deadline">{{deadline}}</label>
          <label for="agents">{{agents}}</label>
        </div> -->
        <!-- IP -
        Interval -
        Deadline
        Agent - agregar nuevo agente -

        Metric: name (readInputRegister - Direccion(300.000, 399.999), 1)  Analogico
        Metric: name (readCoils - Direccion(), 1)  Digital  -->

    </form>
</template>

<script>
const request = require('request-promise-native')
const { serverHost } = require('../config')

// @TODO apply some library to manage time distances
export default {
  data() {
    return {
      success: null,
      errors: [],
      agents: [
        {
          metrics: [
            {
              name: '',
              type: 'analogic'
            }            
          ]
        },
      ],
      ip: "172.16.0.1",
      interval: 1,
      deadline: 5,
      intervalType: "seconds",
      deadlineType: "minutes",
    }
  },
  methods: {
    async checkForm(e) {

      // let agent
      // try {
      //   agent = await request(options)

      e.preventDefault()
      const { ip, interval, deadline, intervalType, deadlineType, agents } = this

      this.errors = [];

      if (!ip) {
        this.errors.push('El IP es obligatorio.')
        return false
      }
      
      if (!interval) {
        this.errors.push('El intervalo es obligatorio.')
        return false
      }

      if (!deadline) {
        this.errors.push('La duración es obligatoria.')
        return false
      }

      if (!agents) {
        this.errors.push('Los agentes son obligatorios.')
        return false
      }
      let agentErrors = []
      agents.forEach(({ metrics }) => {
        if (!metrics) {
          agentErrors.push('Las metricas son obligatorios.')
          return false
        }
        metrics.forEach(({ name }, index) => {
          if (!name) {
            agentErrors.push(`El nombre de la métrica #${index} es obligatorio.`)
            return false
          }
        })
      })

      if (agentErrors && agentErrors.length) {
        this.errors = agentErrors
        return false
      }
      
      const options = {
        method: 'POST',
        url: `${serverHost}/ips`,
        body: {
          ip,
          interval,
          deadline,
          intervalType,
          deadlineType,
          agents
        },
        json: true
      }

      try{
        const added = await request(options)
        this.success = "Se han agregado los agentes con exito."
      }
      catch(e) {
        console.error('no se pudo agregar ip.', e)
      }
    },
    newAgentRow() {
      const agent = { metrics: [{ name: '',type: 'analogic' }] }
      this.agents.push(agent)
    },
    newMetricRow(index){
      const metric = { name: '',type: 'analogic' }
      this.agents[index].metrics.push(metric)
    }

  }

}
</script>

<style scoped>
  * { 
      font-family: 'Roboto', sans-serif;
  }
  input,select, option {
    margin: 5px 0;
    padding: 4px 2px;
    font-size: 14px;
  }
  input::placeholder {
    font-size: 14px;
  }
  .wrapper {
    padding: 25px 25px;
  }
  .agents-cards {
    display: flex;
    justify-items: center;

  }
  .agent-each {
    margin: 15px 15px 15px 0;
    padding: 17px 13px;
    border: 1px solid black;
    border-radius: 4px;
  }
  .agent-each > h3 {
    margin: 0;
  }
  .metric-each {
    margin: 15px 0;
    padding: 5px 0px;
  }

  .title-bold,
  .metric-name-title,
  .metric-type-title {
    margin-top: 6px;
    display: block;
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
    display: block;
  }

  .buttonSubmit {
    width: 300px;
    border-radius: 4px;
    border: 1px solid #98ca3f;
    color: white;
    font-size: 18px;
    background-color: #98ca3f;
    padding: 7px 7px;
    display: block;
  }


  /* The alert message box */
.alert {
  padding: 15px;
  background-color: #f44336; /* Red */
  color: white;
  margin-bottom: 15px;
}
.alert-success {
  padding: 15px;
  background-color: #98ca3f; /* Red */
  color: white;
  margin-bottom: 15px;
}

/* The close button */
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
</style>