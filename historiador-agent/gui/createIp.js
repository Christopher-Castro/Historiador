const fs = require("fs")
const HistoriadorAgent = require('../')
const child_process = require('child_process');

const ModbusRTU = require("modbus-serial")
const client = new ModbusRTU()
const mysql = require('mysql2');
const [node, file, agents] = process.argv

const _agents = JSON.parse(agents)

_agents.map(({ name, group: username, entryType, interval, intervalType, deadline, deadlineType, modbus, db, metrics }) => {
    if (entryType === "example") {

        const timeMeasure2 =
        deadlineType === "seconds" ? 1000 :
        deadlineType === "minutes" ? 1000 * 60 :
        deadlineType === "hours" ? 1000 * 60 * 60 :
        deadlineType === "days" ? 1000 * 60 * 60 * 24 :
        1
  
        const timeout = parseInt(deadline) * timeMeasure2

        const timeMeasure =
        intervalType === "seconds" ? 1000 :
        intervalType === "minutes" ? 1000 * 60 :
        intervalType === "hours" ? 1000 * 60 * 60 :
        intervalType === "days" ? 1000 * 60 * 60 * 24 : 1
    
        const timeMiliseconds = parseInt(interval) * timeMeasure
    
        const agent = new HistoriadorAgent({
            name,
            username,
            interval: timeMiliseconds
        })
        
        metrics.map(({ name, type }) => {
            // tipo de la métrica - agregamos sufijo bool para que
            // luego se muestre como booleano en el chart
            const nameMetric = type === "digital" ? `${name} bool` : name

            agent.addMetric(nameMetric, function getRandomPromise () {
                // if (type === "digital") {
                //     return Promise.resolve(Math.round(Math.random()))
                // }
                return Promise.resolve(Math.random() * 1000)             
            })
        })
        // fs.writeFileSync(`${__dirname}/logs/${new Date().getTime()}-example.json`, JSON.stringify({timeMiliseconds, ...metrics}));

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
        
        setTimeout(() => {
            agent.disconnect()
            // process.exit(0);
        }, timeout)


    }


    if (entryType === "db") {
    //     try {
        const { ip, username, password, dbName } = db
        metrics.map(({ name, type, modbusAddress }) => {
        
        })
    //         const connection = mysql.createConnection({
    //             host,
    //             user,
    //             password,
    //             database
    //         })
    
    //         fs.writeFileSync(
    //             `${__dirname}/logs/${new Date().getTime()}-db-query.json`,
    //             `select ${dbColumns.map(({name})=> name).join(",")} from ${dbTable};`
    //         );
    
    //     } catch (e) {
    //         fs.writeFileSync(
    //             `${__dirname}/logs/${new Date().getTime()}-db-error.json`,
    //             JSON.stringify([e, node, file, entryType, _modbus, db, ip, interval, deadline, intervalType, deadlineType, agents ])
    //         );
    
    //     }
    
    
    }
    


    if (entryType === "modbus") {
    //     const { ip, id } = _modbus
    //     // client.connectTCP(ip);
    //     // viene tambien si fuera modbus
    //     // client.setID(1);
    
    //     fs.writeFileSync(
    //         `${__dirname}/logs/${new Date().getTime()}-modbus-query.json`,
    //         `leyendo ${ip} from ${id};`
    //     );
        const { ip, id } = modbus
        metrics.map(({ dbTable, dbColumn, type }) => {
            
        })
    
    }
    
    
})
