<template>
  <section class="edit-layer">
    <h1>edit-layer Component</h1>
  </section>
</template>

<script lang="js">
  import { LMap, LMarker } from 'vue2-leaflet'
  import L from 'leaflet'
  import LEdit from 'leaflet-editable/src/Leaflet.Editable.js'
  import {readPavement} from '../loaders/pavement_loader'

  export default {
    name: 'edit-layer',
    props: [],
    created () {
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
      load (icao) {
        // Callback for add
        readPavement(this.$store.state.Settings.settings.flightgearDirectory_apt, icao, this.read)
      },
      read (layer) {
        this.groundnet = layer
        if (this.groundnet) {
          this.groundnet.addTo(this.$parent.mapObject)
        }
        this.groundnet.eachLayer(l => {
          l.bringToBack()
        })
      },
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
</style>
