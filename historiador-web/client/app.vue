<template>
  <div class="content">
    <aside>
      <!-- <a
      :key="agent.uuid"
      v-for="agent in agents" >{{agent.uuid}}</a> -->
      <agent
        v-for="agent in agents"
        :uuid="agent.uuid"
        :key="agent.uuid"
        :socket="socket"
      />
      <p v-if="error">{{error}}</p>
    </aside>
    <main class="main-content">
      <metrics
        :agents="agents"
        :metrics="metrics"
        :socket="socket"
        :uuid="uuid"
      />
    </main>
  </div>
</template>

<style>
  body {
    font-family: Arial;
    background: #f8f8f8;
    margin: 0;
  }
.content{
  padding: 15px 15px;
  display: grid;
  justify-content: space-evenly;
  grid-template-columns: 0.3fr 0.7fr;
}
.main-content {
  padding: 15px 15px;
}
</style>

<script>
const request = require('request-promise-native')
const io = require('socket.io-client')
const { serverHost } = require('../config')
const socket = io()

module.exports = {
  data () {
    return {
      agents: [],
      error: null,
      socket
    }
  },
  mounted () {
    this.initialize()
  },
  methods: {
    async initialize () {
      const options = {
        method: 'GET',
        url: `${serverHost}/agents`,
        json: true
      }
      let result
      try {
        result = await request(options)
      } catch (e) {
        this.error = e.error.error
        return
      }
      this.agents = result
      socket.on('agent/connected', payload => {
        const { uuid } = payload.agent
        const existing = this.agents.find(a => a.uuid === uuid)
        console.log('connect payload', payload)
        if (!existing) {
          this.agents.push(payload.agent)

          this.$root.$emit('newAgent',payload.agent)

        }
      })
    }
  }
}
</script>