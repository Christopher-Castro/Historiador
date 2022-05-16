const fs = require("fs")
const HistoriadorAgent = require('../')
const child_process = require('child_process');

const ModbusRTU = require("modbus-serial")
const client = new ModbusRTU()
const mysql = require('mysql2');
const [node, file, agents] = process.argv

const _agents = JSON.parse(agents)

const { Pool } = require('pg');
const { resolve } = require("path");

const timeTotal = (time, timeType) => {
    const timeMeasure =
    timeType === "seconds" ? 1000 :
    timeType === "minutes" ? 1000 * 60 :
    timeType === "hours" ? 1000 * 60 * 60 :
    timeType === "days" ? 1000 * 60 * 60 * 24 : 1
    return time * timeMeasure
}

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: 5432,
    user: 'admin',
    database: 'Historiador',
    password: 'example',
})

const deleteMetrics = async (agentName, timeOffset) => {
const text = `
DELETE FROM metrics 
USING agents 
WHERE agents.id=metrics."agentId" 
AND agents.name=$1
AND NOT metrics."createdAt" between $2 and $3
`
    const now = new Date()
    const offset = new Date(now.getTime()-timeOffset)
    const values = [agentName, offset, now]
    try {
        pool.query(text, values)
        .then(res => console.log('user:', res.rows[0]))
        .catch(err =>
            setImmediate(() => {
                throw err
            })
            )
        return true;
    } catch (error) {
        console.error(error.stack);
        return false;
    }
};

async function validateUuid(name) {
    const text = `
    SELECT * FROM agents 
    WHERE agents.name=$1
    `
    const values = [name]
    try {
        const res = await pool.query(text, values)
        console.log(res.rows[0].uuid)
        // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
        return res.rows[0].uuid
      } catch (err) {
        console.log(err.stack)
      }
}
// dict = {
//     name: "gfds",
//     username: "gfds",
//     interval: "gfds",
// }
// validateUuid('gfds').then(uuid_ => {
//     console.log('a', uuid_)
//     if (uuid_){
//         dict.uuid = uuid_
//     }
//     console.log(dict)
// })



_agents.map(({ name, group, entryType, interval, intervalType, deadlineMode, deadline, deadlineType, modbus, db, metrics, memory }) => {
    validateUuid(name).then(uuid_ => {
        
        const timeout = timeTotal(parseInt(deadline), deadlineType)
        const _interval = timeTotal(parseInt(interval), intervalType)
        
        let dict = {
            name,
            username: group,
            interval: _interval
        }

        if (uuid_){
            dict.uuid = uuid_
        }
    
        const agent = new HistoriadorAgent(dict)
     
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
                          global[nameMetric + 'data'] = result[0][dbColumn]
                          
                        });
                      });
                    return Promise.resolve(global[nameMetric + 'data'])
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
    
        if (deadlineMode == "definida") {
            setTimeout(() => agent.disconnect(), timeout)
        } else {
            if (memory == 'memoria'){
                setInterval(() => deleteMetrics(name, timeout), 1000)
            }
        }
    })
    
})
