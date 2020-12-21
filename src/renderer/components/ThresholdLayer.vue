<template></template>

<script lang="js">
  import { LMap, LMarker } from 'vue2-leaflet'
  import L from 'leaflet'
  import LEdit from 'leaflet-editable/src/Leaflet.Editable.js'
  import {readThresholdXML} from '../loaders/threshold_loader'

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
      getLayer () {
        return this.layerGroup
      },
      load (icao) {
        // Callback for add
        this.layerGroup = readThresholdXML(this.$store.state.Settings.settings.airportsDirectory, icao, this.read)
        if (!this.layerGroup) {
          console.warn('Threshold for ICAO not loaded ' + icao)
          return
        }
        this.layerGroup.addTo(this.$parent.mapObject)
        this.visible = true
        this.icao = icao
      },
      deferredMountedTo (parent) {
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
      setVisible (visible) {
        if (this.layerGroup !== undefined) {
          if (visible !== this.visible) {
            if (visible) {
              this.layerGroup.addTo(this.$parent.mapObject)
            } else {
              this.layerGroup.removeFrom(this.$parent.mapObject)
            }
            this.visible = visible
          }
        }
      },
      zoomUpdated () {
        if (this.layerGroup) {
          this.layerGroup.eachLayer(l => {
            if (l instanceof L.Threshold) {
              l.updateIcon(this.$parent.mapObject)
            }
          })
        }
      }

    },
    computed: {
      edit: function () {
        console.log('Zoom : ' + this.$store.state.Settings.zoom)
        if (this.$store.state.Settings.zoom > 12) {
          console.log('Zoom above 12')
        }
      }
    }
}
</script>

<style scoped lang="scss">
</style>
