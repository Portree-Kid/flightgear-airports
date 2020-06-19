<template>
  <div v-if="airport">
    <h1 class="leaflet-sidebar-header">{{ icao }} {{ name }}</h1>
    <div width="100%" >
        <el-row>
          <el-col :span="7">Airlines :</el-col>
          <el-col :span="15">
            <el-tag v-for="item in airlines" :key="item.value">{{item.value}}</el-tag>
          </el-col>
        </el-row>
    </div>
    <el-tabs v-model="activeTab" >
    <el-tab-pane label="Frequencies" name="first"> 
      <div>
        <el-row v-for="f in frequencyList" :key="f.index">
          <Frequency :frequency="f"></Frequency>
        </el-row>
        <el-button @click="addFrequency" v-if="editing" >Add</el-button>
        </div>
    </el-tab-pane>
    <el-tab-pane label="Parkings" name="second">
      <ParkingList></ParkingList>
    </el-tab-pane>
    <el-tab-pane label="Statistics" name="third">
            <el-row>
          <el-col :span="8">Flights :</el-col>
          <el-col :span="4">{{ flights }}</el-col>
          <el-col :span="8">Parking Positions :</el-col>
          <el-col :span="4">{{ parking }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="8">Groundnet Nodes :</el-col>
          <el-col :span="4">{{groundnet}}</el-col>
          <el-col :span="8"></el-col>
          <el-col :span="4"></el-col>
        </el-row>
    </el-tab-pane>
  </el-tabs>
  </div>
</template>

<script lang="js">
  import Frequency from './Frequency'
  import ParkingList from './ParkingList'

export default {
    data () {
      return {activeTab: 'first', editLayer: null}
    },
    components: {
      Frequency, ParkingList
    },
    methods: {
      addFrequency () {
        this.$store.dispatch('addFrequency', {type: 'AWOS', value: 0})
      },
      initLayer () {
        var parent = this.$parent
        while (parent !== undefined && parent.$refs.editLayer === undefined) {
          parent = parent.$parent
        }
        if (parent === undefined) {
          return
        }
        this.editLayer = parent.$refs.editLayer
      }
    },
    computed: {
      editing: {
        get: function () {
          if (this.editLayer === null) {
            this.initLayer()
          }
          return this.editLayer.editing
        }
      },
      icao: function () {
        return this.$store.state.Airports.currentAirport.icao
      },
      name: function () {
        return this.$store.state.Airports.currentAirport.name
      },
      flights: function () {
        return this.$store.state.Airports.currentAirport.flights
      },
      airlines: function () {
        var airlineCodes = []
        if (this.$store.state.Airports.currentAirport !== undefined && this.$store.state.Airports.currentAirport.airlines) {
          var storedairlineCodes = this.$store.state.Airports.currentAirport.airlines
          storedairlineCodes.forEach(element => {
            airlineCodes.push({value: element, label: element})
          })
        }
        return airlineCodes
      },
      groundnet: function () {
        return this.$store.state.Airports.currentAirport.groundnet
      },
      parking: function () {
        return this.$store.state.Airports.currentAirport.parking
      },
      airport: {
        get: function () {
          return this.$store.state.Airports.currentAirport !== undefined
        }
      },
      frequencyList: {
        // getter
        get: function () {
          return this.$store.state.Frequencies.items
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
   .el-row {
     padding: 0em;
     margin-bottom: 5px;
   }
</style>