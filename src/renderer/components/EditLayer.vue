<template>
  <section class="edit-layer">
    <h1>edit-layer Component</h1>
  </section>
</template>

<script lang="js">
  import { LMap, LMarker } from 'vue2-leaflet'
  import L from 'leaflet'
  import LEdit from 'leaflet-editable/src/Leaflet.Editable.js'
  import {readGroundnetXML, addFeature} from '../loaders/groundnet_loader'

  export default {
    name: 'edit-layer',
    props: [],
    created () {
      console.log(LMap)
      console.log(LMarker)
      console.log(L)
      console.log(LEdit)
    },
    mounted () {
    },
    beforeDestroy () {
      this.remove()
    },
    data () {
      return {
        maxId: 1
      }
    },
    methods: {
      load (icao) {
        if (this.groundnet !== undefined) {
          this.groundnet.removeFrom(this.$parent.mapObject)
        }
        this.groundnet = readGroundnetXML(this.$store.state.Settings.settings.airportsDirectory, icao)
        console.log(this.groundnet.maxId)

        this.groundnet.addTo(this.$parent.mapObject)
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
      },
      enableEdit () {
        this.editable = true
        this.groundnet.eachLayer(l => {
          l.enableEdit()
          if (typeof l.extensions === 'function') {
            l.extensions()
          }
          l.bringToFront()
        })
      },
      disableEdit () {
        this.editable = false
        this.groundnet.eachLayer(l => {
          l.disableEdit()
        })
      },
      drawPolyline () {
        this.$parent.mapObject.editTools.startPolyline()
      },
      drawParking () {
        this.$parent.mapObject.on('click', this.addParking)
      },
      addParking (event) {
        console.log(event.latlng)
        if (event.latlng === undefined) {
          return
        }
        const circle = new L.ParkingSpot(event.latlng, {attributes: {radius: 20, heading: 0}})
        circle.id = (++this.groundnet.maxId)
        circle.addTo(this.groundnet)
        circle.enableEdit()
        circle.extensions()
        circle.addListeners()
        addFeature(circle)
        // console.log(this.groundnet)
        this.$parent.mapObject.off('click', this.addParking)
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
