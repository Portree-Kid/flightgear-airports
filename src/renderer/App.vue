<template>
  <div id="app" >
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'flightgear-airports'
  }
</script>

<style>
html, body {
    height:100%; /*both html and body*/
}
body {
    margin: 0; /*reset default margin*/
}
#app {
  height: 100%;
  width: 100%;
}
</style>
