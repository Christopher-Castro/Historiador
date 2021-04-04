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
    </header>
    <div id="app">
        <router-view></router-view>
    </div>
</div>
</template>

<script>
export default { }
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