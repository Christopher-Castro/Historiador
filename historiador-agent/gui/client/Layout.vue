<template>
<div class="wrapper">
    <Popup>
        <div>
            hola
        </div>
    </Popup>
    <header class="header">
        <div class="header-container">
            <router-link to="/">
                <img src="/images/platziverse.png" width="185" height="38" alt="PlatziVerse">
            </router-link>
        </div>
        <div class="menu">
            <!-- <div class="menu-item">
                <router-link to="/">Panel</router-link>
            </div> -->
        </div>
        <div> 
            <ul id="example-1">
                <button v-for="item in items" :key="item.pid" :title="item.name" @click="kill(item)">
                    {{ item.name }}
                </button>
            </ul>
        </div>
    </header>
    <div id="app">
        <router-view :active_agents="items"></router-view>
    </div>
</div>
</template>

<script>
const request = require('request-promise-native')
const { serverHost } = require('../config')
const Popup = require('./PopUp.vue')

export default { 
    setup () {
		return {
			Popup
		}
	},
    data() {
        return {
            items: [ ]
        }
    },
    methods: {
        async kill(agent){
            const options = {
            method: 'POST',
            url: `${serverHost}/kill`,
            body: {
                agent: agent
            },
                json: true
            }

            try{
                const added = await request(options)
                this.items = this.items.filter(item => item.pid != agent.pid)
            }
            catch(e) {
                console.error('no se pudo detener el agente.', e)
            }
        }
    }
}
</script>

<style scoped>
    .header {
      background: white;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-container {
      padding-left: 15px;
    }
    .menu {
        display:flex;
    }
    .menu-item {
        border: 1px solid black ;
        border: 1px solid blue;
        border-radius: 2px;
        margin: 0 15px;
        padding: 7px 7px;
    }
    .menu-item > * {
        text-decoration: none;
        color: blue;
    }
</style>