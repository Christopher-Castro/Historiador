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

  async function findByDateTypeAgentUuid (dateInit, dateFinish, type, uuid, labelsWeNeed = 20, ts = 1) {
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
    // console.log(metrics)
    let time_labels = metrics.map((metric) => moment(metric.createdAt).format('DD-MM-YYYY HH:mm:ss'))
    let filter_metrics = []
    metrics.forEach((metric, index) => {
      let current_time = moment(metric.createdAt)
      if (time_labels.includes(current_time.add(ts, 's').format('DD-MM-YYYY HH:mm:ss'))){
        filter_metrics.push(metric)
      } else {
        filter_metrics.push(metric)
        let var_time =  current_time.add(ts, 's')
        try{
          while (moment(metrics[index + 1].createdAt).diff(var_time) > 0) {
  
            filter_metrics.push(
              {
                id: metric.id,
                type: metric.type,
                value: null,
                createdAt: var_time.toDate()
              }
            )
  
            var_time =  var_time.add(ts, 's')
          }

        } catch {

        }
      }
    })
    // console.log(filter_metrics)
    if (filter_metrics.length > labelsWeNeed) {
      // get the difference between dates in miliseconds
        const format = 'DD-MM-YYYY HH:mm:ss'
        const diffMs = finish.diff(init)
        
        const msPerLabel = Math.floor(diffMs / labelsWeNeed);    
        const labels = Array.from(Array(labelsWeNeed + 1).keys()).map(i => moment(dateInit).add(msPerLabel * i, 'milliseconds').format(format));
        // console.log(labels)
        return filter_metrics.filter((metric) => {
          return labels.includes(moment(metric.createdAt).format(format))
        });
      // return the metrics with the step      
    }    
    return filter_metrics; 

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
