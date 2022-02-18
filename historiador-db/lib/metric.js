'use strict'

const { Op } = require("sequelize")

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

  async function findByDateTypeAgentUuid (dateInit, dateFinish, type, uuid) {
    
    return MetricModel.findAll({
      attributes: ['id', 'type', 'value', 'createdAt'],
      where: {
        type,
        createdAt: {
          [Op.lte]: dateFinish,
          [Op.gte]: dateInit
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
