'use strict'

const { Op } = require("sequelize")
const moment = require('moment')

module.exports = function setupMetric (MetricModel, AgentModel) {
  
  async function findByAgentUuid (uuid) {
    return MetricModel.findAll({
      attributes: ['type'],
      group: ['type'],
      include: [{
        attributes: [],
        model: AgentModel,
        where: {
          uuid
        }
      }],
      raw: true
    })
  }

  async function findByTypeAgentUuid (type, uuid) {
    return MetricModel.findAll({
      attributes: ['id', 'type', 'value', 'createdAt'],
      where: {
        type
      },
      limit: 20,
      order: [['createdAt', 'DESC']],
      include: [{
        attributes: [],
        model: AgentModel,
        where: {
          uuid
        }
      }],
      raw: true
    })
  }

  async function findByDateTypeAgentUuid (dateInit, dateFinish, type, uuid, labelsWeNeed = 20) {
    const init = moment(dateInit).utcOffset(0)
    const finish = moment(dateFinish).utcOffset(0)
    const metrics = await MetricModel.findAll({
      attributes: ['id', 'type', 'value', 'createdAt'],
      where: {
        type,
        createdAt: {
          [Op.lte]: finish,
          [Op.gte]: init
        } 
      },
      order: [['createdAt', 'ASC']],
      include: [{
        attributes: [],
        model: AgentModel,
        where: {
          uuid
        }
      }],
      raw: true
    })
    // if the quantity of dates is more than the quantity of dates we need
    if (metrics.length > labelsWeNeed) {
      // get the difference between dates in miliseconds
        const format = 'DD-MM-YYYY HH:mm:ss'
        const diffMs = finish.diff(init)
        
        const msPerLabel = Math.floor(diffMs / labelsWeNeed);    
        const labels = Array.from(Array(labelsWeNeed + 1).keys()).map(i => moment(dateInit).add(msPerLabel * i, 'milliseconds').format(format));
        return metrics.filter((metric) => {
          return labels.includes(moment(metric.createdAt).format(format))
        });
      // return the metrics with the step      
    }    
    return metrics; 

  }

  async function create (uuid, metric) {
    const agent = await AgentModel.findOne({
      where: { uuid }
    })

    if (agent) {
      Object.assign(metric, { agentId: agent.id })
      const result = await MetricModel.create(metric)
      return result.toJSON()
    }
  }

  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid,
    findByDateTypeAgentUuid
  }
}
