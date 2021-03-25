'use strict'

const debug = require('debug')('historiador:api:db')

module.exports = {
  db: {
    database: process.env.DB_NAME || 'Historiador',
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'example',
    host: process.env.DB_HOST || 'db',
    dialect: 'postgres',
    logging: s => debug(s)
  },
  auth: {
    secret: process.env.SECRET || 'example',
    algorithms: ['HS256']
  }
}
