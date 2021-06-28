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
  const turf = require('@turf/turf')


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
        var polyLine = this.$parent.mapObject.editTools.startPolygon(undefined, {color: 'green'})
        var layerGroup = this.toolLayerGroup;
        polyLine.addTo(this.toolLayerGroup)
        polyLine.on('click', event => {
          polyLine.removeFrom(layerGroup);
        });
        polyLine.on('editable:drawing:end', event => {          
          console.debug('editable:drawing:end', event)
          var latLngs = event.target.getLatLngs()[0].map( latLng => ([latLng.lat, latLng.lng]));          


          // turf rings must start/end with the same point
          latLngs.push(latLngs[0]);
          var longest = 0;
          var angleLongest = 0;
          latLngs.forEach((item, index, arr) => {
            if (index > 0) {
              var angle = turf.bearing(turf.point([arr[index-1][1], arr[index-1][0]]), turf.point([arr[index][1], arr[index][0]])) + 180;
              
              var dist = turf.distance( turf.point(arr[index-1]), turf.point(arr[index]));
              if (dist>longest) {
                longest = dist;
                angleLongest = angle;                
              }
            }
          });          
          event.target.bindTooltip(angleLongest.toFixed(2) + '°', {permanent: true})

          var ring = [latLngs];

          this.$emit('select-poly', ring);
        })
        polyLine.on('editable:vertex:dragend', event => {          
          console.debug(event)
          var latLngs = event.target.getLatLngs()[0].map( latLng => ([latLng.lat, latLng.lng]));          


          // turf rings must start/end with the same point
          latLngs.push(latLngs[0]);
          var longest = 0;
          var angleLongest = 0;
          latLngs.forEach((item, index, arr) => {
            if (index > 0) {
              var angle = turf.bearing(turf.point([arr[index-1][1], arr[index-1][0]]), turf.point([arr[index][1], arr[index][0]])) + 180;
              
              var dist = turf.distance( turf.point(arr[index-1]), turf.point(arr[index]));
              if (dist>longest) {
                longest = dist;
                angleLongest = angle;                
              }
            }
          });          
          event.target.setTooltipContent(angleLongest.toFixed(2) + '°')

          var ring = [latLngs];

          this.$emit('select-poly', ring);
        })

      },

    },
    computed: {

    }
}
</script>

<style scoped lang="scss">
</style>
