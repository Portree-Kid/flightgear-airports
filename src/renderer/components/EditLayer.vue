<template>
  <section class="edit-layer">
    <h1>edit-layer Component</h1>
  </section>
</template>

<script lang="js">
  import { LMap, LMarker } from 'vue2-leaflet'
  import L from 'leaflet'
  import LEdit from 'leaflet-editable/src/Leaflet.Editable.js'
  import {readGroundnetXML} from '../loaders/groundnet_loader'

  export default {
    name: 'edit-layer',
    props: [],
    created () {
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'BOUNDS') {
          // console.log(this.$parent)
          // console.log(this.$store.state.Settings.bounds)
          let airportsToLoad = this.$store.state.Airports.airports
            .filter(feature => this.visible(feature))
            .map(feature => feature.properties.icao)
          if (airportsToLoad[0] !== this.editingAirport) {
            this.groundnet = readGroundnetXML(this.$store.state.Settings.settings.airportsDirectory, airportsToLoad[0])
            this.groundnet.addTo(this.$parent.mapObject)
            this.editingAirport = airportsToLoad[0]
          }
          // console.log(this.groundnet)
        }
      })
    },
    mounted () {
      console.log(LMap)
      console.log(LMarker)
      console.log(L)
      console.log(LEdit)
    },
    beforeDestroy () {
      this.remove()
    },
    data () {
      return {
      }
    },
    methods: {
      visible (feature) {
        let bounds = this.$store.state.Settings.bounds
        let coordinates = feature.geometry.coordinates
        let ret = bounds.getNorthEast().lat > Number(coordinates[1]) &&
                  bounds.getNorthEast().lng > Number(coordinates[0])
        let ret2 = bounds.getSouthWest().lat < Number(coordinates[1]) &&
                  bounds.getSouthWest().lng < Number(coordinates[0])
        return ret && ret2
      },
      deferredMountedTo (parent) {
        this.layerGroup = L.layerGroup()
      },
      remove () {
        if (this.layerGroup) {
          this.$parent.removeLayer(this.layerGroup)
        }
      },
      add () {
        if (this.$parent._isMounted) {
          this.deferredMountedTo(this.$parent.mapObject)
        }
      }
    },
    computed: {
      edit: function () {
        console.log('Zoom : ' + this.$store.state.Settings.zoom)
        if (this.$store.state.Settings.zoom > 12) {
          console.log()
        }
      }
    }
}
</script>

<style scoped lang="scss">
  .edit-layer {

  }
</style>
