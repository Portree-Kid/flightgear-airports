<!--
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->
<template></template>

<script lang="js">
  import { LMap, LMarker } from 'vue2-leaflet'
  import L from 'leaflet'
  import LEdit from 'leaflet-editable/src/Leaflet.Editable.js'
  import {readTowerXML} from '../loaders/tower_loader'
  import {writeTowerXML} from '../loaders/tower_writer'

  export default {
    name: 'tower-layer',
    props: [],
    created () {
      console.debug([LMap, LMarker, L, LEdit])
    },
    mounted () {

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
        this.$parent.mapObject.createPane('tower-pane')
        this.$parent.mapObject.getPane('tower-pane').style.zIndex = 550
        // Callback for add
        this.layerGroup = readTowerXML(this.$store.state.Settings.settings.airportsDirectory, icao, this.read)
        if (!this.layerGroup) {
          console.warn('Tower for ICAO not loaded ' + icao)
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
      enableEdit () {
        if (this.layerGroup) {
          this.layerGroup.eachLayer(l => {
            if (l instanceof L.TowerMarker) {
              l.enableEdit(this.$parent.mapObject)
            }
          })
        }
      },
      save () {
        this.layerGroup.eachLayer(l => {
          if (l instanceof L.TowerMarker) {
            var latitude = l.getLatLng().lat.toFixed(6)
            var longitude = l.getLatLng().lng.toFixed(6)
            var height = l.elev_m

            var o = {latitude: latitude, longitude: longitude, height: height}
            writeTowerXML(this.$store.state.Settings.settings.airportsDirectory, l.icao, o)
          }
        })
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
            if (l instanceof L.TowerMarker) {
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
          console.log()
        }
      }
    }
}
</script>

<style scoped lang="scss">
</style>
