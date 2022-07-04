'use strict'

const express = require('express')
const asyncify = require('express-asyncify')
const child_process = require('child_process');
const process = require('process');

var bodyParser = require('body-parser')

const api = asyncify(express.Router())

api.use(bodyParser.json())

api.post('/ips', async(req, res) => {
  const { body: { agents } } = req 

  try {
    // const timeMeasure =
    //   agents.deadlineType === "seconds" ? 1000 :
    //   agents.deadlineType === "minutes" ? 1000 * 60 :
    //   agents.deadlineType === "hours" ? 1000 * 60 * 60 :
    //   agents.deadlineType === "days" ? 1000 * 60 * 60 * 24 :
    //   1 * 1000 * 60
    // console.log(agents)
    // console.log(timeMeasure)
    // console.log(agents[0].deadline)
    // const timeout = parseInt(agents[0].deadline) * timeMeasure
    console.log(agents)
    var child = child_process.spawn("node", ["createIp.js", JSON.stringify(agents)], {
      // timeout,
      // detached: true,
    })
  //   console.log('entramos al timeout de 5s');
  //   setTimeout(function(){
  //     console.log('matamos el proceso');
  //     console.log(child.pid)
  //     child.kill();
  // }, 5000);
    // return res.send(JSON.stringify(agents))
    return res.send(JSON.stringify(child))
    // return res.status(201).send(JSON.stringify({ip, interval, deadline, intervalType, deadlineType, agents}))
  } catch(e) {
    console.error(e)
    return res.status(400).send(new Error("No se pudo crear una nueva IP.", e))
  }
})

api.post('/kill', async(req, res) => {
  const { body: { agent } } = req 
  process.kill(agent.pid)
  return res.send({message: 'hola'})
})

module.exports = api