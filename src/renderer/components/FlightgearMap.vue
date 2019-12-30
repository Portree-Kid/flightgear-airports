<template>
  <l-map
    :zoom="zoom"
    :center="center"
    @update:zoom="zoomUpdated"
    @update:center="centerUpdated"
    @update:bounds="boundsUpdated"
  >
    <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
    <!--<l-marker :lat-lng="marker"></l-marker>-->
    <LeafletSidebar></LeafletSidebar>
    <EditLayer></EditLayer>
    <l-layer-group layerType="overlay" name="Sources">
      <l-circle
        v-for="(item, index) in this.$store.state.Airports.airports"
        :key="index"
        :lat-lng="[item.geometry.coordinates[1], item.geometry.coordinates[0]]"
        :radius="((item.properties.flights+5)*20)"
        :color="item.properties.color"
        @click="onClick(item)"
      ></l-circle>
    </l-layer-group>
  </l-map>
</template>

<script lang="js">
  import 'leaflet/dist/leaflet.css'
  import { LMap, LTileLayer, LMarker, LCircle, LLayerGroup } from 'vue2-leaflet'
  import LeafletSidebar from './LeafletSidebar'
  import EditLayer from './EditLayer'
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
    components: { LMap, LTileLayer, LMarker, LCircle, LeafletSidebar, EditLayer, LLayerGroup },
    props: [],
    mounted () {

    },
    data () {
      return {
        url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        marker: L.latLng(47.413220, -1.219482),
        airports: this.$store.state.Airports.airports
      }
    },
    methods: {
      onClick (item) {
        console.log(item)
        this.$store.commit('SET_EDIT_AIRPORT', item)
      },
      zoomUpdated (zoom) {
        this.$store.commit('ZOOM', zoom)
      },
      centerUpdated (center) {
        this.$store.commit('CENTER', center)
      },
      boundsUpdated (bounds) {
        this.bounds = bounds
      }
    },
    computed: {
      zoom: function () {
        return this.$store.state.Settings.zoom
      },
      center: function () {
        return this.$store.state.Settings.center
      }
    }
}
</script>

<style scoped lang="scss">
.vue2leaflet-map {
  height: 100%;
}
.l-map {
  height: 100%;
}
.flightgear-map {
  color: aqua;
}
</style>
