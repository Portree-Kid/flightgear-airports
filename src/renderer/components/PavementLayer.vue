<template></template>

<script lang="js">
  import { LMap, LMarker } from 'vue2-leaflet'
  import L from 'leaflet'
  import LEdit from 'leaflet-editable/src/Leaflet.Editable.js'
  import {readPavement} from '../loaders/pavement_loader'
  import * as turf from '@turf/turf'

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
      return {}
    },
    methods: {
      getLayer () {
        return this.pavement
      },
      load (icao) {
        // Callback for add
        readPavement(this.$store.state.Settings.settings.flightgearDirectory_apt, icao, this.read)
      },
      // Callback called when pavement read
      read (layer) {
        this.pavement = layer
        if (this.pavement) {
          this.pavement.on('add', this.onAdd)
          this.pavement.addTo(this.$parent.mapObject)
          this.visible = true
        } else {
          this.$message({
            type: 'Error',
            showClose: true,
            message: `Couldn't load pavement from ${this.$store.state.Settings.settings.flightgearDirectory_apt}`
          })
        }
      },
      onAdd () {
        this.pavement.eachLayer(l => {
          if (l) {
            l.bringToBack()
          }
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
        if (this.pavement) {
          this.$parent.removeLayer(this.layerGroup)
        }
      },
      add () {
        if (this.$parent._isMounted) {
          this.deferredMountedTo(this.$parent.mapObject)
        }
      },
      isOnRunway (latlng) {
        var ret = false
        this.pavement.eachLayer(l => {
          if (l instanceof L.RunwayPolygon) {
            console.debug(l)
            if (turf.booleanContains(l.turfyRunway, this.latToTurf(latlng))) {
              ret = true
            }
          }
        })
        return ret
      },
      latToTurf  (turfPoint) {
        return turf.point([turfPoint.lng, turfPoint.lat])
      },
      setVisible (visible) {
        if (this.pavement !== undefined) {
          if (visible !== this.visible) {
            if (visible) {
              this.pavement.addTo(this.$parent.mapObject)
              this.pavement.eachLayer(l => {
                if (l) {
                  l.bringToBack()
                }
              })
            } else {
              this.pavement.removeFrom(this.$parent.mapObject)
            }
            this.visible = visible
          }
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
