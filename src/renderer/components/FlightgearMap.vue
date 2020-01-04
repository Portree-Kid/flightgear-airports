<template>
  <l-map
    :zoom="zoom"
    :center="center"
    :options="options"
    @update:zoom="zoomUpdated"
    @update:center="centerUpdated"
    @update:bounds="boundsUpdated"
  >
    <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
    <!--<l-marker :lat-lng="marker"></l-marker>-->
    <LeafletSidebar></LeafletSidebar>
    <PavementLayer ref="pavementLayer"></PavementLayer>
    <l-layer-group layerType="overlay" name="airports" ref="airportLayer">
      <l-circle
        v-for="(item, index) in this.$store.state.Airports.airports"
        :key="index"
        :lat-lng="[item.geometry.coordinates[1], item.geometry.coordinates[0]]"
        :radius="((item.properties.flights+5)*20)"
        :color='item.color'
        @add="addEvent($event, item)"
        @click="onClick(item)"
      ></l-circle>
    </l-layer-group>
    <EditLayer ref="editLayer"></EditLayer>
  </l-map>
</template>

<script lang="js">
  import 'leaflet/dist/leaflet.css'
  import { LMap, LTileLayer, LMarker, LCircle, LLayerGroup } from 'vue2-leaflet'
  import LeafletSidebar from './LeafletSidebar'
  import EditLayer from './EditLayer'
  import PavementLayer from './PavementLayer'
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
    components: { LMap, LTileLayer, LMarker, LCircle, LeafletSidebar, EditLayer, PavementLayer, LLayerGroup },
    props: [],
    mounted () {
      this.$store.dispatch('getAirports')
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'BOUNDS') {
          // console.log(this.$parent)
          // console.log(this.$store.state.Settings.bounds)
          let airportsToLoad = this.$store.state.Airports.airports
            .filter(feature => this.visible(feature))
            .map(feature => feature.properties.icao)
          if (airportsToLoad.length > 0 && airportsToLoad[0] !== this.editingAirport && this.zoom > 12) {
            this.$refs.editLayer.load(airportsToLoad[0])
            this.$refs.pavementLayer.load(airportsToLoad[0])
            this.editingAirport = airportsToLoad[0]
          }
          // console.log(this.groundnet)
        }
      })
      this.$refs.airportLayer.on('add', function (event) {
        console.log('Add vertex ', event)
      })
    },
    data () {
      return {
        url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        marker: L.latLng(47.413220, -1.219482),
        airports: this.$store.state.Airports.airports,
        options: {editable: true}
      }
    },
    methods: {
      visible (feature) {
        let bounds = this.$store.state.Settings.bounds
        let coordinates = feature.geometry.coordinates
        let ret = bounds.getNorthEast().lat > Number(coordinates[1]) &&
                  bounds.getNorthEast().lng > Number(coordinates[0])
        let ret2 = bounds.getSouthWest().lat < Number(coordinates[1]) &&
                  bounds.getSouthWest().lng < Number(coordinates[0])
        return ret && ret2
      },
      color (item) {
        console.log(item)
      },
      addEvent (event, item) {
        console.log(event, item)
        if (item.properties.groundnet === 0) {
          event.target.setStyle({color: 'red', fillcolor: 'red'})
        } else if ((item.properties.flights / item.properties.parking) > 10) {
          event.target.setStyle({color: 'yellow', fillcolor: 'yellow'})
        }
      },
      onClick (item) {
        console.log(item)
        this.$store.commit('SET_EDIT_AIRPORT', item)
      },
      zoomUpdated (zoom) {
        this.$store.dispatch('setZoom', zoom)
        console.log(this.$refs.airportLayer.setVisible(zoom < 12))
      },
      centerUpdated (center) {
        this.$store.dispatch('setCenter', center)
      },
      boundsUpdated (bounds) {
        this.$store.dispatch('setBounds', bounds)
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
