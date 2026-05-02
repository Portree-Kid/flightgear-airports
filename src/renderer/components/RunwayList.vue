<template>
  <div>
    <!--
    <h1 class="leaflet-sidebar-header">
      Parking List
      <div class="leaflet-sidebar-close">
        <i class="fa fa-caret-left"></i>
      </div>
    </h1>
    -->
      <el-container direction="vertical">
          <el-button @click="createDefault" class="button">
              <i class="fas fa-bullseye"></i>
          </el-button>
          <div v-for="r in runways" v-bind:key="r.index" class="row">
              <RunwayItem :runway="r"></RunwayItem>
          </div>
      </el-container>
  </div>
</template>

<script lang="js">
  import RunwayItem from './RunwayItem'
  import {readRwyUseXML, writeRwyUseXML} from '../loaders/rwyuse_loader'
  export default {
    name: 'runway-list',
    components: {RunwayItem},
    props: {icao: String},
    data () {
      return {
      }
    },
    computed: {
      runways: {
      // getter
        get: function () {
          if (this.$store.state.Airports.currentAirport.runways !== undefined) {
            return this.$store.state.Airports.currentAirport.runways
          }
        },
        // setter
        set: function (newValue) {
          console.log(newValue)
        }
      }
    },
    beforeUpdate: function () {
      console.log('beforeUpdate RunwayList')
      this.$nextTick(function () {
        console.log('Loading ', this.icao)
        readRwyUseXML(this.$store.state.Settings.settings.airportsDirectory, this.icao)
      })
    },
    methods: {
      createDefault () {
        writeRwyUseXML(this.$store.state.Settings.settings.airportsDirectory, this.icao, this.runways)
      }
    }

}
</script>

<style>
div.row.div {
  display: flex;
  justify-content: space-between;
}
</style>


