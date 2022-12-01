const HistoriadorAgent = require ('../')

const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://localhost')
message_value = 0
message_value_bool = false

client.on('message', function (topic, message) {
  console.log('holaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
  console.log(topic)
  message_value = parseFloat(message)
})
client.subscribe('topico')

const agent = new HistoriadorAgent({
    name: 'mysqlll',
    username: 'admin',
    interval: 1000
})
//tipo de la métrica
agent.addMetric('Power', function getStart () {
  value = message_value
  return value
})

agent.connect()

// This agent only
agent.on('connected', handler)
agent.on('disconnected', handler)
agent.on('message', handler)

// Other Agents
agent.on('agent/connected', handler)
agent.on('agent/disconnected', handler)
agent.on('agent/message', handler)

function handler (payload) {
  console.log(payload)
}