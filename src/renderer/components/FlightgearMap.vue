<template>
  <l-map
    :zoom="zoom"
    :center="center"
    :options="options"
    @update:zoom="zoomUpdated"
    @update:center="centerUpdated"
    @update:bounds="boundsUpdated"
    ref="map"
  >
    <!--The backgroundmap-->
    <l-tile-layer :url="url" :attribution="attribution" :options="{maxZoom: 22, maxNativeZoom: 17}"></l-tile-layer>
    <l-control position="topright" >
      <el-button @click="editAirport()">{{ icao }}</el-button>
    </l-control>
    <!--<l-marker :lat-lng="marker"></l-marker>-->
    <LeafletSidebar></LeafletSidebar>
    <EditBar></EditBar>
    <PavementLayer ref="pavementLayer"></PavementLayer>
    <l-layer-group layerType="overlay" name="airports" ref="airportLayer">
      <l-circle
        v-for="(item, index) in this.$store.state.Airports.airports"
        :key="index"
        :lat-lng="[item.geometry.coordinates[1], item.geometry.coordinates[0]]"
        :radius="((item.properties.flights+5)*20)"
        :color="item.color"
        @add="addEvent($event, item)"
        @click="onClick(item)"
      ></l-circle>
    </l-layer-group>
    <EditLayer ref="editLayer"></EditLayer>
  </l-map>
</template>

<script lang="js">
  import 'leaflet/dist/leaflet.css'
  import { LMap, LTileLayer, LMarker, LCircle, LLayerGroup, LControl } from 'vue2-leaflet'
  import LeafletSidebar from './LeafletSidebar'
  import EditBar from './EditBar'
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
    components: { LMap, LTileLayer, LMarker, LCircle, LeafletSidebar, EditBar, EditLayer, PavementLayer, LLayerGroup, LControl },
    props: [],
    mounted () {
      this.$store.dispatch('getAirports')
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'BOUNDS' || mutation.type === 'SET_AIRPORTS') {
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
          this.$refs.editLayer.setVisible(this.zoom >= 12)
          this.$refs.airportLayer.setVisible(this.zoom < 12)

          // console.log(this.groundnet)
        }
      })
    },
    data () {
      return {
        // 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        url: 'https://a.tile.openstreetmap.de/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        marker: L.latLng(47.413220, -1.219482),
        airports: this.$store.state.Airports.airports,
        options: {editable: true},
        icao: 'TEST'
      }
    },
    methods: {
      editAirport () {
        if (this.editingAirport) {
          let airportsToLoad = this.$store.state.Airports.airports
            .filter(feature => feature.properties.icao === this.icao)
          let properties = Object.assign({}, airportsToLoad[0].properties)
          this.$store.commit('SET_EDIT_AIRPORT', properties)
        }
      },
      setIcao (icao) {
        this.icao = icao
        this.$store.dispatch('setCurrentAirport', icao)
      },
      visible (feature) {
        let bounds = this.$store.state.Settings.bounds
        if (!bounds.hasOwnProperty('getNorthEast')) {
          bounds = this.$refs.map.mapObject.getBounds()
        }
        let width = bounds.getNorthWest().distanceTo(bounds.getSouthEast())
        // Load all airports in a minimum 5 km box
        if (width < 5000) {
          let rest = 5000 - width
          let padFactor = rest / width
          bounds = bounds.pad(padFactor)
        }

        let coordinates = feature.geometry.coordinates
        let ret = bounds.getNorthEast().lat > Number(coordinates[1]) &&
                  bounds.getNorthEast().lng > Number(coordinates[0])
        let ret2 = bounds.getSouthWest().lat < Number(coordinates[1]) &&
                  bounds.getSouthWest().lng < Number(coordinates[0])
        return ret && ret2
      },
      // Triggered by adding airports to the map
      addEvent (event, item) {
        // console.log(event, item)
        if (item.properties.groundnet === 0) {
          event.target.setStyle({color: 'red', fillColor: 'red'})
        } else if ((item.properties.flights / item.properties.parking) > 40) {
          event.target.setStyle({color: 'yellow', fillColor: 'yellow'})
        }
      },
      onClick (item) {
        console.log(item)
        this.$store.commit('SET_EDIT_AIRPORT', item.properties)
      },
      zoomUpdated (zoom) {
        if (zoom !== this.$store.state.Settings.zoom) {
          this.$store.dispatch('setZoom', zoom)
          this.$refs.airportLayer.setVisible(zoom < 12)
          this.$refs.pavementLayer.setVisible(zoom < 12)
        }
      },
      async centerUpdated (center) {
        if (center !== this.$store.state.Settings.center) {
          this.$store.dispatch('setCenter', center)
          this.$refs.airportLayer.setVisible(this.zoom < 12)
          this.$refs.pavementLayer.setVisible(this.zoom < 12)
        }
      },
      async boundsUpdated (bounds) {
        if (bounds !== this.$store.state.Settings.bounds) {
          this.$store.dispatch('setBounds', bounds)
          this.$refs.airportLayer.setVisible(this.zoom < 12)
          this.$refs.pavementLayer.setVisible(this.zoom < 12)
        }
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
.item {
    padding: 18px 0;
}
.l-control.el-card {
    padding-left: 2px;
    padding-top: 0px;
    padding-right: 2px;
    padding-bottom: 0px;
}
</style>
