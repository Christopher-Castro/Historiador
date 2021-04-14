const HistoriadorAgent = require ('../')

const mysql = require('mysql2');

var con = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "example",
  database: "db01"
});

let data
var i = 0

con.connect(function(err) {
  if (err) throw err;
    con.query("SELECT metrica01 FROM tabla01", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    data = result
    console.log(data)
  });
});




const agent = new HistoriadorAgent({
    name: 'mysqlll',
    username: 'admin',
    interval: 2000
})

//tipo de la métrica
agent.addMetric('startCmd', function getStart () {
  return Promise.resolve(data[i].startCmd)
})

agent.addMetric('stopCmd', function getStop () {
  return Promise.resolve(data[i].stopCmd)
})

agent.addMetric('status', function getStatus () {
  return Promise.resolve(data[i].status)
})

agent.addMetric('speedSP', function getSpeedSP () {
  return Promise.resolve(data[i].speedSP)
})

agent.addMetric('PVspeed', function getSpeedPV () {
  var aux =  data[i].speedPV
  if (i < (data.length-1) ) {
    i++
  } else {
    agent.disconnect()
  }
  return Promise.resolve(aux)
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