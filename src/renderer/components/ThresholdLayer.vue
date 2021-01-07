<template></template>

<script lang="js">
  import { LMap, LMarker } from 'vue2-leaflet'
  import L from 'leaflet'
  import LEdit from 'leaflet-editable/src/Leaflet.Editable.js'
  import {readThresholdXML} from '../loaders/threshold_loader'
  import {writeThresholdXML} from '../loaders/threshold_writer'

  export default {
    name: 'edit-layer',
    props: [],
    created () {
    },
    mounted () {
      console.debug(LMap, LMarker, L, LEdit)
      this.$store.watch(
        function (state) {
          return state.Editable.data.threshold
        },
        () => { this.editedThreshold() }
        ,
        {
          deep: true
        }
      )
    },
    beforeDestroy () {
      this.remove()
    },
    data () {
      return {
      }
    },
    methods: {
      editedThreshold () {
        var rwy = this.$store.state.Editable.data.threshold.runway
        var displacement = this.$store.state.Editable.data.threshold.displacement
        this.layerGroup.eachLayer(l => {
          if (l instanceof L.Threshold) {
            if (l.rwy === rwy) {
              l.setDisplacement(displacement)
            }
          }
        })
      },
      getLayer () {
        return this.layerGroup
      },
      load (icao) {
        this.$parent.mapObject.createPane('threshold-pane')
        this.$parent.mapObject.getPane('threshold-pane').style.zIndex = 550
        if (this.layerGroup) {
          this.layerGroup.removeFrom(this.$parent.mapObject)
        }
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
      save () {
        if (this.layerGroup) {
          var list = {}

          this.layerGroup.eachLayer(l => {
            if (l instanceof L.Threshold) {
              var latitude = l.originLatLng[0].toFixed(6)
              var longitude = l.originLatLng[1].toFixed(6)

              if (list[l.index] === undefined) {
                list[l.index] = []
              }
              var o = {latitude: latitude, longitude: longitude, index: l.index, rwy: l.rwy, heading: l.heading, displacement: l.displacement, stopw_m: l.stopw_m}
              list[l.index].push(o)
            }
          })
          writeThresholdXML(this.$store.state.Settings.settings.airportsDirectory, this.icao, list)
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
