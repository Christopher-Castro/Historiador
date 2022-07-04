'use strict'

const express = require('express')
const asyncify = require('express-asyncify')
const request = require('request-promise-native')

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
  const { dateInit, dateFinish, labelsWeNeed } = req.body

  if (!dateInit || !dateFinish) return next(new Error(`no date init or date finish dateInit: ${dateInit}, dateFinish: ${dateFinish} `))

  const options = {
    method: 'POST',
    url: `${endpoint}/api/metrics/date/${uuid}/${type}`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    body: {
      dateInit: req.body.dateInit,
      dateFinish: req.body.dateFinish,
      labelsWeNeed: req.body.labelsWeNeed,
      ts: req.body.ts,
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

module.exports = api