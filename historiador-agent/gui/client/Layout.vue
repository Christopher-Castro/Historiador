<template>
<div class="wrapper">
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
            <ul>
                Agentes activos:
            </ul>
            <ul id="example-1">
                <button v-for="item in items" :key="item.pid" :title="item.name" @click.self="() => TogglePopup('buttonTrigger')">
                    {{ item.name }}
                    <Popup 
                        v-if="popupTriggers.buttonTrigger" 
                        :TogglePopup="() => TogglePopup('buttonTrigger', item)"
                        :ClosePopup="() => ClosePopup('buttonTrigger')">
                        <h2>¿Está seguro que desea finalizar la ejecución del agente: {{ item.name }}?</h2>
                        <h2>Al finalizar la ejecución del agente se finaliza la ejecución de todos los demás agentes asociados al mismo durante su creación.</h2>
                    </Popup>
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
import { ref } from 'vue'
import Popup from './Popup.vue'

export default {
    components: { Popup },
    setup () {
		return {
			Popup
		}
	},
    data() {
        return {
            items: [ ],
            popupTriggers: {
                buttonTrigger: false,
                timedTrigger: false
            }
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
        },
        TogglePopup(trigger, item) {
            if (this.popupTriggers[trigger] == true && item ) {
                this.popupTriggers[trigger] = false
                this.kill(item)
            }else {
                this.popupTriggers[trigger] = true
            }
            return
		},
        ClosePopup(trigger) {
            this.popupTriggers[trigger] = false
            return
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