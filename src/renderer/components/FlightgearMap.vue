<template>
    <l-map :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      <l-marker :lat-lng="marker"></l-marker>
      <LeafletSidebar></LeafletSidebar>
    </l-map>
</template>

<script lang="js">
  import 'leaflet/dist/leaflet.css'
  import { LMap, LTileLayer, LMarker } from 'vue2-leaflet'
  import LeafletSidebar from './LeafletSidebar'
  import L from 'leaflet'

  // https://github.com/KoRiGaN/Vue2Leaflet/issues/103
  delete L.Icon.Default.prototype._getIconUrl

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
  })
  export default {
    name: 'flightgear-map',
    components: { LMap, LTileLayer, LMarker, LeafletSidebar },
    props: [],
    mounted () {

    },
    data () {
      return {
        zoom: 13,
        center: L.latLng(47.413220, -1.219482),
        url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        marker: L.latLng(47.413220, -1.219482)
      }
    },
    methods: {
    },
    computed: {

    }
}
</script>

<style scoped lang="scss">
  .vue2leaflet-map {
    height: 100%;
  }
  .l-map{
    height: 100%;
  }
  .flightgear-map {
     color: aqua
  }
</style>
