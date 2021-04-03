const fs = require("fs")
// const ModbusRTU = require("modbus-serial")
// const HistoriadorAgent = require('historiador-agent')
// const client = new ModbusRTU()
const [node, file, ip, interval, deadline, intervalType, deadlineType, agents ] = process.argv
// const aux;

const _agents = JSON.parse(agents)

// client.connectTCP(ip);
// client.setID(1);

fs.writeFileSync(
    `${__dirname}/logs/${new Date().getTime()}.json`,
    JSON.stringify([node, file, ip, interval, deadline, intervalType, deadlineType, agents ])
);


_agents.map(({ metrics }) => {
    const timeMeasure =
    intervalType === "seconds" ? 1000 :
    intervalType === "minutes" ? 1000 * 60 :
    intervalType === "hours" ? 1000 * 60 * 60 :
    intervalType === "days" ? 1000 * 60 * 60 * 24 :
    1

    const timeMiliseconds = interval * timeMeasure

    // const agent = new HistoriadorAgent({
    //     name: 'myapp',
    //     username: 'admin',
    //     interval: timeMiliseconds
    // })
    
    metrics.map(({ name, type }) => {
        fs.writeFileSync(
            `${__dirname}/logs/${name}-${type}.json`,
            `${name}-${type}`
        );
        // tipo de la métrica - agregamos sufijo bool para que
        // luego se muestre como booleano en el chart
        agent.addMetric(`${type === "digital" ? `${name} bool` :name}`, function getModbus () {
            if (type === "analogic") {

            }

            if (type === "digital") {

            }

            
            // // preguntar
            // client.readInputRegisters(100, 1)
            // .then(function(data) {
            //     aux=data.data[0];
            // })
            // return aux
        })
    })

    // agent.connect()

    // // This agent only
    // agent.on('connected', handler)
    // agent.on('disconnected', handler)
    // agent.on('message', handler)

    // // Other Agents
    // agent.on('agent/connected', handler)
    // agent.on('agent/disconnected', handler)
    // agent.on('agent/message', handler)

    // function handler (payload) {
    //     console.log(payload)
    // }
})










