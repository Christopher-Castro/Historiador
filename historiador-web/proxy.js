'use strict'

const express = require('express')
const asyncify = require('express-asyncify')
const request = require('request-promise-native')
const child_process = require('child_process');

var bodyParser = require('body-parser')

const { endpoint, apiToken } = require('./config')

const api = asyncify(express.Router())

api.use(bodyParser.json())

api.get('/agents', async (req, res, next) => {
  const options = {
    method: 'GET',
    url: `${endpoint}/api/agents`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await request(options)
  } catch (e) {
    return next(new Error(e.error.error))
  }

  res.send(result)
})

api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  const options = {
    method: 'GET',
    url: `${endpoint}/api/agent/${uuid}`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await request(options)
  } catch (e) {
    return next(new Error(e.error.error))
  }

  res.send(result)
})

api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  const options = {
    method: 'GET',
    url: `${endpoint}/api/metrics/${uuid}`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await request(options)
  } catch (e) {
    return next(new Error(e.error.error))
  }

  res.send(result)
})

api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params
  const options = {
    method: 'GET',
    url: `${endpoint}/api/metrics/${uuid}/${type}`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await request(options)
  } catch (e) {
    return next(new Error(e.error.error))
  }

  res.send(result)
})

api.post('/metrics/date/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params
  const options = {
    method: 'GET',
    url: `${endpoint}/api/metrics/date/${uuid}/${type}`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    body: {
      dateInit: req.body.dateInit,
      dateFinish: req.body.dateFinish
    },
    json: true
  }

  let result
  try {
    result = await request(options)
  } catch (e) {
    return next(new Error(e.error.error))
  }

  res.send(result)
})

api.post('/ips', async(req, res) => {
  const { body: { ip, interval, deadline, intervalType, deadlineType, agents } } = req 
  try {
    const timeMeasure =
      deadlineType === "seconds" ? 1000 :
      deadlineType === "minutes" ? 1000 * 60 :
      deadlineType === "hours" ? 1000 * 60 * 60 :
      deadlineType === "days" ? 1000 * 60 * 60 * 24 :
      1

    const timeout = deadline * timeMeasure
    child_process.spawn("node", ["createIp.js",ip, interval, deadline, intervalType, deadlineType, JSON.stringify(agents)], {
      timeout,
      detached: true,
    })
    return res.send(JSON.stringify(agents))
    // return res.status(201).send(JSON.stringify({ip, interval, deadline, intervalType, deadlineType, agents}))
  } catch(e) {
    console.error(e)
    return res.status(400).send(new Error("No se pudo crear una nueva IP.", e))
  }
})

module.exports = api