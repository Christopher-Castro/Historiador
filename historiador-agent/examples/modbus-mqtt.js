const HistoriadorAgent = require ('../')

var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();

var aux;

// open connection to a tcp line
//client.connectTCP("0.0.0.0", { port: 8502 });
client.connectTCP("192.168.100.54");
client.setID(1);


const agent = new HistoriadorAgent({
    name: 'myapp',
    username: 'admin',
    interval: 2000
})

//tipo de la métrica
agent.addMetric('modbus', function getModbus () {
    client.readHoldingRegisters(100, 1)
    .then(function(data) {
        aux=data.data[0];
    })
    return aux
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

//setTimeout(() => agent.disconnect(), 20000)