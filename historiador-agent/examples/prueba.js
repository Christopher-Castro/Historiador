const HistoriadorAgent = require ('../')

const mysql = require('mysql2');

var con = mysql.createConnection({
  host: "mysql",
  port: 3306,
  user: "root",
  password: "example",
  database: "db01"
});

let data
var i = 0
var aux = "metrica01";






const agent = new HistoriadorAgent({
    name: 'mysqlll',
    username: 'admin',
    interval: 2000
})

//tipo de la métrica
agent.addMetric('startCmd', function getStart () {
  con.connect(function(err) {
    if (err) throw err;
      con.query("SELECT metrica01 FROM tabla01 ORDER BY id DESC LIMIT 1", function (err, result, fields) {
      if (err) throw err;
      data = result[0][aux]
    });
  });
  return Promise.resolve(data)
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