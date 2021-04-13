<template>
  <div class="w">
    <h1>Panel de creación de módulo</h1>
    <div class="alert-success" v-if="success && success.length">
      <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
      {{success}}
    </div>
    <div class="alert" v-if="errors.length">
      <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
      <li v-for="(error, index) in errors" :key="index">{{error}}</li>
    </div>
    <div class="left-side">
        <button type="button" class="addAgentButton" @click="newAgentRow()">Agregar Agente</button>
        <button class="buttonSubmit" type="submit" @click="checkForm()">Agregar Módulo</button>
    </div>
    <form class="wrapper" >
          <div class="agents-cards">
            <div class="agent-each" v-for="({ metrics },_index) in agents" :key="_index">
              <div class="title-agent-wrapper">
                <h3>Agente #{{_index}}</h3>
                <a class="close delete-cross" @click="deleteAgent(_index)"></a>

                <b class="metric-name-title">{{`Nombre del agente #${_index}`}}</b>
                <input :placeholder="`Nombre del agente #${_index}`" type="text" v-model="agents[_index].name" id="agent-name">
                
                <b class="metric-name-title">{{`Grupo del agente #${_index}`}}</b>
                <input :placeholder="`Grupo del agente #${_index}`" type="text" v-model="agents[_index].group" id="agent-group">

                <div class="connection-type">
                  <b class="metric-type-title">Tipo de conexión</b>
                  
                  <label for="db">Base de datos</label>
                  <input type="radio" id="db" value="db" v-model="agents[_index].entryType" />
                  
                  <label class="left-margin" for="modbus">Modbus</label>
                  <input type="radio" id="modbus" value="modbus" v-model="agents[_index].entryType" />   

                  <label class="left-margin" for="example">Example</label>
                  <input type="radio" id="example" value="example" v-model="agents[_index].entryType" />  
                </div>

                <div class="db-inputs" v-if="agents[_index].entryType === 'db'" >
                  <b class="title-bold">IP de la DB</b>
                  <input placeholder="IP de la máquina" type="text" v-model="agents[_index].db.ip">

                  <b class="title-bold">Username</b>
                  <input placeholder="Username" type="text" v-model="agents[_index].db.username">

                  <b class="title-bold">Password</b>
                  <input placeholder="Password" type="password" v-model="agents[_index].db.password">

                  <b class="title-bold">Nombre de la DB</b>
                  <input placeholder="Nombre de la DB" type="text" v-model="agents[_index].db.dbName">
                </div>

                <div class="modbus-inputs" v-if="agents[_index].entryType === 'modbus'">
                  <b class="title-bold">Ip Modbus</b>
                  <input placeholder="Ip Modbus" type="text" v-model="agents[_index].modbus.ip">

                  <b class="title-bold">Id Modbus</b>
                  <input placeholder="Id Modbus" type="number" v-model="agents[_index].modbus.id">
                </div>

                <b class="title-bold">Intervalo de muestreo</b>
                <input placeholder="Intervalo de muestreo" type="number" min="1" name="interval" v-model="agents[_index].interval">
                <select name="time-range-interval" v-model="agents[_index].intervalType">
                  <option value="seconds">Segundos</option>
                  <option value="minutes">Minutos</option>
                  <option value="hours">Horas</option>
                  <option value="days">Dias</option>
                </select>

                <b class="title-bold">Duración de la toma de datos</b>
                <input placeholder="Duración de la toma de datos" type="number" min="1" name="deadline" v-model="agents[_index].deadline">
                <select name="time-range-deadline" v-model="agents[_index].deadlineType">
                  <option value="seconds">Segundos</option>
                  <option value="minutes">Minutos</option>
                  <option value="hours">Horas</option>
                  <option value="days">Dias</option>
                </select>

              </div>

              <div class="metric-each" v-for="(metric, index) in metrics" :key="index">
                <b class="metric-name-title">{{`Nombre de la métrica #${index}`}}</b>
                <input :placeholder="`Nombre de la métrica #${index}`" type="text" v-model="metric.name" id="metric-name">
                <!-- if modbus -->
                <div v-if="agents[_index].entryType === 'modbus'" class="modbus-wrapper">
                  <b class="title-bold">Dirección de la métrica #{{index}}</b>
                  <input :placeholder="`Dirección de la métrica #${index}`" type="text" v-model="metric.modbusAddress" id="metric-name">
                </div>
                <!-- if DB -->
                <div v-if="agents[_index].entryType === 'db'" class="db">
                  <b class="title-bold">Nombre de la Tabla</b>
                  <input placeholder="Nombre de la Tabla" type="text" v-model="metric.dbTable">

                  <b class="title-bold">Nombre de la metrica # {{index}}</b>
                  <input :placeholder="`Nombre de la metrica # ${index}`" type="text" v-model="metric.dbColumn">
                </div>
                
                <b class="metric-type-title">Tipo de métrica</b>
                <a class="close delete-cross" @click="deleteMetric(_index, index)"></a>
                <label for="analogic">Analógico</label>
                <input type="radio" id="analogic" value="analogic" v-model="metric.type" />
                
                <label class="left-margin" for="digital">Digital</label>
                <input type="radio" id="digital" value="digital" v-model="metric.type" />             
              </div>
              
              <button type="button" class="buttonFilter" @click="newMetricRow(_index)">Agregar Métrica</button>
            </div>
          </div>
    </form>
  </div>
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
          name: '',
          group: '',
          entryType: 'db',
          interval: 1,
          deadline: 5,
          intervalType: "seconds",
          deadlineType: "minutes",
          modbus: {
            ip: null,
            id: null
          },
          db: {
            ip: null,
            username: null,
            password: null,
            dbName: null     
          },
          metrics: [
            {
              name: '',
              type: 'analogic',
              dbTable: null,
              dbColumn: null,
              modbusAddress: null
            }            
          ]
        },
      ],

    }
  },
  methods: {
    async checkForm() {
      const { agents } = this

      this.errors = [];

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
          // if (!ip) {
          //   this.errors.push('El IP es obligatorio.')
          //   return false
          // }
          
          // if (!interval) {
          //   this.errors.push('El intervalo es obligatorio.')
          //   return false
          // }

          // if (!deadline) {
          //   this.errors.push('La duración es obligatoria.')
          //   return false
          // }

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
          agents: this.agents
        },
        json: true
      }

      try{
        const added = await request(options)
        this.success = "Se han agregado los agentes con exito."
      }
      catch(e) {
        console.error('no se pudo agregar agente.', e)
      }
    },
    newDbColumn() {
      const dbColumn = { name: '' }
      this.db.dbColumns.push(dbColumn)
    },
    deleteDbColumn(index) {
      this.db.dbColumns.splice(index, 1)
    },
    newAgentRow() {
      const agent = { name:'', group: '', metrics: [{ name: '',type: 'analogic' }] }
      this.agents.push(agent)
    },
    deleteAgent(index) {
      this.agents.splice(index, 1)
    },
    newMetricRow(index){
      const metric = { name: '',type: 'analogic' }
      this.agents[index].metrics.push(metric)
    },
    deleteMetric(agentIndex, index) {
      this.agents[agentIndex].metrics.splice(index, 1)
    }

  }

}
</script>

<style scoped>
  * { 
      font-family: 'Roboto', sans-serif;
  }
  h1 {
    padding-left: 25px;
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
    padding: 0px 25px;
  }
  .connection-type {
    margin-top: 20px;
    margin-bottom: 15px;
  }

  .left-margin {
    margin-left: 5px;
  }

  .agents-cards {
    display: flex;
    justify-items: center;

  }
  .agent-each {
    margin: 0 15px 15px 0;
    padding: 15px 30px;
    border: 1px solid black;
    border-radius: 4px;
  }
  .agent-each > h3 {
    margin: 0;
  }
  .metric-each {
    position: relative;
    background-color: #f3f4ed;
    border-radius: 5px;
    margin: 15px 0;
    padding: 15px;
  }

  .title-agent-wrapper {
    position: relative;
  }

  .title-agent-wrapper > h3{
    margin-top: 0px;
  }
  .left-side {
    display: flex;
    position: fixed;
    bottom: 15px;
    right: 15px;
  }
  .title-bold,
  .metric-name-title,
  .metric-type-title {
    margin-top: 6px;
    display: block;
  }
  .buttonFilter {
    width: 100%;
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
  .addAgentButton {
    width: 300px;
    border-radius: 4px;
    border: 1px solid blue;
    color: blue;
    font-size: 18px;
    background-color: white;
    padding: 7px 7px;
    display: block;
    margin-top: 15px;
    margin-right: 15px;    
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
    margin-top: 15px;
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

.delete-cross {
  /* position: absolute; */
  /* top: 5px; */
  /* right: 5px */
}

.close {
  position: absolute;
  cursor: pointer;
  right: -5px;
  top: 4px;
  width: 32px;
  height: 32px;
}
.close:before, .close:after {
  position: absolute;
  left: 15px;
  content: ' ';
  height: 15px;
  width: 2px;
  background-color:red;
}
.close:before {
  transform: rotate(45deg);
}
.close:after {
  transform: rotate(-45deg);
}
</style>