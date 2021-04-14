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
                if (type === "digital") {
                    return Promise.resolve(Math.round(Math.random()))
                }
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
        const { ip, password, dbName } = db

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

        const connection = mysql.createConnection({
            host: "mysql",
            port: 3306,
            user: "root",
            password: "example",
            database: "db01"
        })

        const agent = new HistoriadorAgent({
            name,
            username,
            interval: timeMiliseconds
        })
        
        
        metrics.map(({ dbTable, dbColumn, type }) => {
            //tipo de la métrica
            //const nameMetric = type === "digital" ? `${name} bool` : name
            
            connection.connect(function(err) {
                if (err) throw err;
                  con.query("SELECT metrica01 FROM tabla01", function (err, result, fields) {
                  if (err) throw err;
                  return result
                  
                });
              });
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

        setTimeout(() => agent.disconnect(), timeout)
            
    
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

        var aux;

        // open connection to a tcp line
        //client.connectTCP("0.0.0.0", { port: 502 });
        client.connectTCP(ip);
        client.setID(parseInt(id, 10));


        const agent = new HistoriadorAgent({
            name,
            username,
            interval: timeMiliseconds
        })

        metrics.map(({ name, type, modbusAddress }) => {
            //tipo de la métrica
            const nameMetric = type === "digital" ? `${name} bool` : name

            agent.addMetric(nameMetric, function getModbus () {
                if(type== "digital"){
                    client.readCoils(modbusAddress, 1)
                    .then(function(data) {
                        aux=data.data[0];
                    })
                    return aux
                }
                client.readInputRegisters(modbusAddress, 1)
                .then(function(data) {
                    aux=data.data[0];
                })
                return aux
            })
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

        setTimeout(() => agent.disconnect(), timeout)

        
    
    }
    
    
})
