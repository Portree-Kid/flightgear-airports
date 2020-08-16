<!--
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->
<template>
  <l-map
    :zoom="zoom"
    :center="center"
    :options="options"
    @ready="ready"
    @update:zoom="zoomUpdated"
    @update:center="centerUpdated"
    @update:bounds="boundsUpdated"
    ref="map"
  >
    <!--The backgroundmap-->
    <l-tile-layer :url="url" :attribution="attribution" :options="{maxZoom: 22, maxNativeZoom: 17}"></l-tile-layer>
    <!--
    <l-control position="topright" >
      <el-button @click="editAirport()">{{ icao }}</el-button>
    </l-control>
    -->
    <!--<l-marker :lat-lng="marker"></l-marker>-->
    <LeafletSidebar ref="sidebar" @editParking="onEditSidebar" @edit="onEdit($event)"></LeafletSidebar>
    <AiLayer ref="aiLayer"></AiLayer> 
    <PavementLayer ref="pavementLayer"></PavementLayer>    
    <ThresholdLayer ref="thresholdLayer"></ThresholdLayer>
    <l-layer-group layerType="overlay" name="airports" ref="airportLayer">
      <l-circle
        v-for="(item, index) in this.$store.state.Airports.airports"
        :key="index"
        :lat-lng="[item.geometry.coordinates[1], item.geometry.coordinates[0]]"
        :radius="((item.properties.flights+5)*20)"
        :color="item.color"
        @add="addEvent($event, item)"
        @click="onClick($event, item)"
      ></l-circle>
    </l-layer-group>
    <EditLayer ref="editLayer"></EditLayer>
    <ToolLayer ref="toolLayer" @select-poly="onSelectedPolygon"></ToolLayer>
    <EditBar ref="editBar" @edit="onEdit($event)"></EditBar>
    <ToolBar ref="toolBar"></ToolBar>
  </l-map>
</template>

<script lang="js">
  import 'leaflet/dist/leaflet.css'
  import '@/assets/button.css'
  import { LMap, LTileLayer, LMarker, LCircle, LLayerGroup, LControl } from 'vue2-leaflet'
  import LeafletSidebar from './LeafletSidebar'
  import AiLayer from './AiLayer'
  import EditBar from './EditBar'
  import ToolBar from './ToolBar'
  import EditLayer from './EditLayer'
  import ToolLayer from './ToolLayer'
  import PavementLayer from './PavementLayer'
  import ThresholdLayer from './ThresholdLayer'

  import { Loading } from 'element-ui'
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
    components: { LMap, LTileLayer, LMarker, LCircle, LeafletSidebar, AiLayer, EditBar, ToolBar, EditLayer, PavementLayer, LLayerGroup, LControl, ThresholdLayer, ToolLayer },
    props: [],
    created () {
      this.loadingInstance = null
      this.$store.watch(
        function (state) {
          return state.Loading.icao
        },
        (newValue, oldValue) => {
          // debugger
          console.log('setIcaoLoading ' + oldValue + ' => ' + newValue + ' ' + this.groundnetLoaded + ' ' + this.pavementLoaded + ' ' + this.loadingInstance)
          if (newValue !== oldValue && newValue !== '') {
            this.groundnetLoaded = newValue
            if ((this.loadingInstance === null || this.loadingInstance === undefined)) {
              this.loadingInstance = Loading.service({ fullscreen: false })
            }
          }
        }
        ,
        {
          deep: false,
          immediate: true
        }
      )
      this.$store.watch(
        function (state) {
          return state.Loading.groundnetLoaded
        },
        (newValue, oldValue) => {
          // debugger
          console.log('groundnetLoaded ' + oldValue + ' => ' + newValue + ' ' + this.groundnetLoaded + ' ' + this.pavementLoaded + ' ' + this.loadingInstance)
          if (newValue !== oldValue) {
            this.groundnetLoaded = newValue
            if (this.groundnetLoaded &&
                this.pavementLoaded &&
                this.loadingInstance !== null) {
              this.loadingInstance.close()
              this.loadingInstance = null
            }
          }
        }
        ,
        {
          deep: false,
          immediate: true
        }
      )
      this.$store.watch(
        function (state) {
          return state.Loading.pavementLoaded
        },
        (newValue, oldValue) => {
          console.log('pavementLoaded ' + oldValue + ' => ' + newValue + ' ' + this.groundnetLoaded + ' ' + this.pavementLoaded + ' ' + this.loadingInstance)
          if (newValue !== oldValue) {
            this.pavementLoaded = newValue
            if (this.groundnetLoaded &&
                this.pavementLoaded &&
                this.loadingInstance !== null) {
              this.loadingInstance.close()
              this.loadingInstance = null
            }
          }
        }
        ,
        {
          deep: false,
          immediate: true
        }
      )
    },
    mounted () {
      this.$store.dispatch('getAirports')
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'CENTER' || mutation.type === 'SET_AIRPORTS' || mutation.type === 'ZOOM') {
          // console.log(this.$parent)
          // console.log(this.$store.state.Settings.bounds)
          let airportsToLoad = this.$store.state.Airports.airports
            .filter(feature => this.visible(feature))
            .map(feature => feature.properties.icao)
          if (airportsToLoad.length > 0 && airportsToLoad[0] !== this.editingAirport && this.zoom > 12) {
            this.$store.dispatch('setIcaoLoading', airportsToLoad[0])
            this.$nextTick(() => { // Loading should be closed asynchronously
              this.$refs.pavementLayer.load(airportsToLoad[0])
              this.$refs.editLayer.load(airportsToLoad[0])
              this.$refs.thresholdLayer.load(airportsToLoad[0])
              this.editingAirport = airportsToLoad[0]
            })
          }
          if (this.$refs.editLayer) {
            this.$refs.editLayer.setVisible(this.zoom >= 12)
          }
          if (this.$refs.airportLayer) {
            this.$refs.airportLayer.setVisible(this.zoom < 12)
          }

          // console.log(this.groundnet)
        }
      })
    },
    data () {
      return {
        loadingInstance: Object,
        groundnetLoaded: false,
        pavementLoaded: false,
        url: 'https://a.tile.openstreetmap.de/{z}/{x}/{y}.png',
        attribution: '<A href="https://github.com/Portree-Kid/flightgear-airports" target="_blank">Flightgear Airports ' + require('electron').remote.app.getVersion() +
        '</A> <A href="https://www.electronjs.org/" target="_blank">Electron</A> ' +
        ' <A href="https://element.eleme.io/#/en-US/" target="_blank">element.io</A> ' +
        ' &copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        airports: this.$store.state.Airports.airports,
        options: {editable: true},
        layersControl: null,
        icao: 'TEST'
      }
    },
    methods: {
      ready (e) {
        console.log(e)
        e.on('layeradd', this.onLayerAdd)
      },
      onLayerAdd (e) {
        if (this.layersControl === null) {
          this.layersControl = L.control.layers({}, {}, {position: 'topleft'})
          this.layersControl.addTo(this.$refs.map.mapObject)
          var icon = this.layersControl._container.ownerDocument.createElement('I')
          icon.className = 'fas fa-layer-group'
          icon.style = 'padding-top: 9px; height: 30px; width: 30px; text-align: center; vertical-align: sub;'
          this.layersControl._container.children[0].appendChild(icon)
          // this.layersControl.addOverlay(this.$refs.thresholdLayer, 'Threshold Layer')
        }
        if (this.$refs.pavementLayer.getLayer() === e.layer) {
          // debugger
          var l = this.layersControl._layers.filter(l => l.name === 'APT Layer')
          if (l.length === 0) {
            this.layersControl.addOverlay(this.$refs.pavementLayer.getLayer(), 'APT Layer')
          }
        }
        if (this.$refs.thresholdLayer.getLayer() === e.layer) {
          l = this.layersControl._layers.filter(l => l.name === 'Threshold Layer')
          if (l.length === 0) {
            this.layersControl.addOverlay(this.$refs.thresholdLayer.getLayer(), 'Threshold Layer')
          }
        }
      },
      onSelectedPolygon (ring) {
        var parkings = this.$refs.editLayer.getParkings(ring)
        console.debug(ring)
        console.debug(parkings)

        this.$store.commit('SET_EDIT_TYPE', 'parking-group')
        this.$refs.sidebar.setData(parkings)
      },
      onEdit (event) {
        if (event) {
          this.$refs.map.mapObject.options.minZoom = 13
        } else {
          this.$refs.map.mapObject.options.minZoom = 1
        }
        this.$refs.editLayer.enableEdit()
        this.$refs.editBar.setEditing(event)
        this.$refs.toolBar.setEditing(event)
        this.$refs.sidebar.setEditing(event)
      },
      onEditSidebar (event) {
        this.$refs.editLayer.onEdit(event)
      },
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
        let bounds
        if (this.$refs.map) {
          bounds = this.$refs.map.mapObject.getBounds()
        } else {
          return false
        }
        let width = L.latLng(bounds._northEast).distanceTo(L.latLng(bounds._southWest))
        // Load all airports in a minimum 5 km box
        if (width < 5000) {
          let rest = 5000 - width
          let padFactor = rest / width
          bounds = bounds.pad(padFactor)
        }

        let coordinates = feature.geometry.coordinates
        let ret = bounds._northEast.lat > Number(coordinates[1]) &&
                  bounds._northEast.lng > Number(coordinates[0])
        let ret2 = bounds._southWest.lat < Number(coordinates[1]) &&
                  bounds._southWest.lng < Number(coordinates[0])
        return ret && ret2
      },
      normalStyle (target) {
        if (target.airport.properties.groundnet === 0) {
          target.setStyle({color: 'red', fillColor: 'red', weight: '2'})
        } else if ((target.airport.properties.flights / target.airport.properties.parking) > 40) {
          target.setStyle({color: 'yellow', fillColor: 'yellow', weight: '2'})
        } else {
          target.setStyle({color: '#3388ff', fillColor: '#3388ff', weight: '2'})
        }
      },
      highlightStyle (target) {
        if (target.airport.properties.groundnet === 0) {
          target.setStyle({color: 'red', fillColor: 'red', weight: '5'})
        } else if ((target.airport.properties.flights / target.airport.properties.parking) > 40) {
          target.setStyle({color: 'yellow', fillColor: 'yellow', weight: '5'})
        } else {
          target.setStyle({color: '#3388ff', fillColor: '#3388ff', weight: '5'})
        }
      },
      // Triggered by adding airports to the map
      addEvent (event, item) {
        this.selected = null
        event.target.airport = item
        // console.log(event, item)
        this.normalStyle(event.target)
      },
      onClick (event, item) {
        console.log(item)
        if (this.selected !== null) {
          this.normalStyle(this.selected)
        }
        this.selected = event.target
        this.highlightStyle(this.selected)
        event.target.bringToBack()
        this.setIcao(item.properties.icao)
        this.$store.commit('SET_EDIT_AIRPORT', item.properties)
        let newCenter = L.latLng(item.geometry.coordinates[1], item.geometry.coordinates[0])
        this.$refs.map.setCenter(newCenter)
      },
      zoomUpdated (zoom) {
        if (zoom !== this.$store.state.Settings.zoom) {
          this.$store.dispatch('setZoom', zoom)
          this.$refs.airportLayer.setVisible(zoom < 12)
          this.$refs.pavementLayer.setVisible(zoom >= 12)
        }
      },
      async centerUpdated (center) {
        if (center !== this.$store.state.Settings.center) {
          this.$store.dispatch('setCenter', center)
          this.$refs.airportLayer.setVisible(this.zoom < 12)
          this.$refs.pavementLayer.setVisible(this.zoom >= 12)
        }
      },
      async boundsUpdated (bounds) {
        /*
        if (bounds !== this.$store.state.Settings.bounds) {
          this.$store.dispatch('setBounds', bounds)
          this.$refs.airportLayer.setVisible(this.zoom < 12)
          this.$refs.pavementLayer.setVisible(this.zoom < 12)
        }
        */
      }
    },
    computed: {
      zoom: function () {
        return this.$store.state.Settings.zoom
      },
      isEditing: function () {
        return this.$refs.editLayer !== undefined && this.$refs.editLayer.editing
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
.leaflet-touch .leaflet-control-layers-toggle {
  width: 30px;
  height: 30px;
}
</style>
