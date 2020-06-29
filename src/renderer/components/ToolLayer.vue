<!--
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->
<template></template>

<script lang="js">
/* eslint-disable */
  import {LMap, LMarker} from 'vue2-leaflet'
  import L from 'leaflet'
  import LEdit from 'leaflet-editable/src/Leaflet.Editable.js'

  export default {
    name: 'tool-layer',
    props: [],
    mounted () {
      this.add()
    },
    beforeDestroy () {
      this.remove()
    },
    data () {
      return {

      }
    },
    methods: {
      deferredMountedTo (parent) {
        this.toolLayerGroup = L.layerGroup();
        this.toolLayerGroup.addTo(this.$parent.mapObject)
      },
      remove () {
        if (this.sidebar) {
          this.$parent.removeLayer(this.sidebar)
        }
      },
      add () {
        if (this.$parent._isMounted) {
          this.deferredMountedTo(this.$parent.mapObject)
        }
      },
      stopDrawing () {
        this.$parent.mapObject.editTools.stopDrawing()
        this.toolLayerGroup.eachLayer((layer) => {
          layer.removeFrom(this.toolLayerGroup);
        });
      },
      drawPolyline () {
        var polyLine = this.$parent.mapObject.editTools.startPolyline(undefined, {color: 'green'})
        polyLine.addTo(this.toolLayerGroup)
        polyLine.toolLayerGroup = this.toolLayerGroup;
      },

    },
    computed: {

    }
}
</script>

<style scoped lang="scss">
</style>
