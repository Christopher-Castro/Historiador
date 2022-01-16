const fs = require("fs")
const HistoriadorAgent = require('../')
const child_process = require('child_process');

const ModbusRTU = require("modbus-serial")
const client = new ModbusRTU()
const mysql = require('mysql2');
const [node, file, agents] = process.argv

const _agents = JSON.parse(agents)

const timeTotal = (time, timeType) => {
    const timeMeasure =
    timeType === "seconds" ? 1000 :
    timeType === "minutes" ? 1000 * 60 :
    timeType === "hours" ? 1000 * 60 * 60 :
    timeType === "days" ? 1000 * 60 * 60 * 24 : 1
    return time * timeMeasure
}

_agents.map(({ name, group, entryType, interval, intervalType, deadline, deadlineType, modbus, db, metrics }) => {
 
    const timeout = timeTotal(parseInt(deadline), deadlineType)
    const _interval = timeTotal(parseInt(interval), intervalType)
    
    const agent = new HistoriadorAgent({
        name,
        username: group,
        interval: _interval
    })
 
    if (entryType === "example") {
        metrics.map(({ name, type }) => {
            // tipo de la métrica - agregamos sufijo bool para que
            // luego se muestre como booleano en el chart
            const nameMetric = type === "digital" ? `${name} bool` : name

            agent.addMetric(nameMetric, function getRandomPromise () {
                if (type === "digital") {
                    return Promise.resolve(Math.round(Math.random()))
                }
                return Promise.resolve(Math.random() * 1000)             
            })
        })
    }

    if (entryType === "db") {
    //     try {
        const { ip, username, password, dbName } = db
        var data;
        const connection = mysql.createConnection({
            host: ip,
            port: 3306,
            user: username,
            password: password,
            database: dbName
        })
        // TODO: aca agregue `name` 
        metrics.map(({ name, dbTable, dbColumn, fKey, type }) => {
            const nameMetric = type === "digital" ? `${name} bool` : name
            
            agent.addMetric(nameMetric, function getDB() {
                connection.connect(function(err) {
                    if (err) throw err;
                    connection.query(`SELECT ${dbColumn} FROM ${dbTable} ORDER BY ${fKey} DESC LIMIT 1`, function (err, result, fields) {
                      if (err) throw err;
                      data = result[0][dbColumn]
                      
                    });
                  });
                return Promise.resolve(data)
            })
            
            
        })
    }
    
    if (entryType === "modbus") {
        const { ip, id } = modbus
        var aux;

        // open connection to a tcp line
        //client.connectTCP("0.0.0.0", { port: 502 });
        client.connectTCP(ip);
        client.setID(parseInt(id, 10));

        metrics.map(({ name, type, modbusAddress }) => {
            //tipo de la métrica
            const nameMetric = type === "digital" ? `${name} bool` : name

            agent.addMetric(nameMetric, async function getModbus () {
                if(type== "digital"){
                    await client.readCoils(modbusAddress, 1)
                    .then(function(data) {
                        aux=data.data[0];
                    })
                    return aux
                }
                await client.readInputRegisters(modbusAddress, 1)
                .then(function(data) {
                    aux=data.data[0];
                })
                return aux
            })
        })    
    }

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

    setTimeout(() => agent.disconnect(), timeout)
    
})
