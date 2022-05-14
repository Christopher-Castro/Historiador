const HistoriadorAgent = require ('../')

const mysql = require('mysql2');

var con = mysql.createConnection({
  host: "mysql",
  port: 3306,
  user: "root",
  password: "example",
  database: "db_test"
});

let data = 'dataa'
let data1 = 'dataa1'
var i = 0
var aux = "metrica01";






const agent = new HistoriadorAgent({
    name: 'mysqlll',
    username: 'admin',
    interval: 2000
})

//tipo de la métrica
agent.addMetric('Power', async function getStart () {
  await con.connect(function(err) {
    if (err) throw err;
      con.query("SELECT Power FROM pump ORDER BY id DESC LIMIT 1", function (err, result, fields) {
      if (err) throw err;
      global[data] = result[0]['Power']
    });
  });
  return Promise.resolve(global[data])
})

agent.addMetric('Rpms', async function getStart () {
  await con.connect(function(err) {
    if (err) throw err;
      con.query("SELECT Rpms FROM pump ORDER BY id DESC LIMIT 1", function (err, result, fields) {
      if (err) throw err;
      global[data1] = result[0]['Rpms']
    });
  });
  return Promise.resolve(global[data1])
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