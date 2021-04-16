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

con.connect(function(err) {
  if (err) throw err;
    con.query("SELECT LAST metrica01 FROM tabla01", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log(result[0]);
    console.log(result[0].metrica01);
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
  return Promise.resolve(data[0])
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