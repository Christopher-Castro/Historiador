'use strict'

const debug = require('debug')('historiador:web')
const http = require('http')
const path = require('path')
const fs = require("fs");

var cors = require('cors')

const express = require('express')
const asyncify = require('express-asyncify')
const socketio = require('socket.io')
const chalk = require('chalk')
const HistoriadorAgent = require('historiador-agent')

const proxy = require('./proxy')
const {pipe} = require('./utils')

const port = process.env.PORT || 8001
const app = asyncify(express())
const server = http.createServer(app)
const io = socketio(server)
const agent = new HistoriadorAgent()

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))
// es lo mismo que hacer ./public
app.use('/', proxy)

app.get("*", (req, res) => {
  fs.readFile(`${__dirname}/public/index.html`, "utf8", (err, data) => {
    return res.send(data)
  })
})

// Socket.io /WebSockets
io.on('connect', socket => {
    debug(`Connected ${socket.id}`)

    pipe(agent, socket)
})

// Express error handler
app.use((err, req, res, next) => {
    debug(`Error: ${err.message}`)
  
    if (err.message.match(/not found/)) {
      return res.status(404).send({ error: err.message })
    }
  
    res.status(500).send({ error: err.message })
  })

function handleFatalError (err) {
    console.error(`${chalk.red('[fatal error]')} ${err.message}`)
    console.error(err.stack)
    process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  console.log(`${chalk.green('[historiador-web]')} server listening on port ${port}`)
  agent.connect()
})
