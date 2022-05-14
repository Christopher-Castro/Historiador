'use strict'

const Sequelize = require('sequelize')
let sequelize = null

module.exports = function setupDatabase (config) {
  if (!sequelize) {
    sequelize = new Sequelize({
      ...config,
      logging: console.log
    })
  }
  return sequelize
}
