<template>
  <div>
    <div width="100%" v-if="airport">
        <el-row>
          <el-col :span="7">ICAO :</el-col>
          <el-col :span="17">{{ icao }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Name :</el-col>
          <el-col :span="17">{{ name }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Airlines :</el-col>
          <el-col :span="15">
            <el-tag v-for="item in airlines" :key="item.value">{{item.value}}</el-tag>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">Flights :</el-col>
          <el-col :span="7">{{ flights }}</el-col>
          <el-col :span="5">Parking :</el-col>
          <el-col :span="7">{{ parking }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Groundnet :</el-col>
          <el-col :span="15">{{groundnet}}</el-col>
        </el-row>
    </div>
    <el-divider  v-if="airport"></el-divider>  
    <h3 v-if="airport">Frequencies</h3>  
    <div v-if="airport">
        <el-row v-for="f in Frequencies" :key="f.index">
          <Frequency :frequency="f"></Frequency>
        </el-row>
        <el-button @click="addFrequency" v-if="editing" >Add</el-button>
    </div>
  </div>
</template>

<script lang="js">
  import Frequency from './Frequency'
  export default {
    data () {
      return { }
    },
    components: {
      Frequency
    },
    methods: {
      addFrequency () {
        this.$store.dispatch('addFrequency', {type: 'AWOS', value: 0})
      }
    },
    computed: {
      editing: {
        get: function () {
          return this.$parent.$parent.$parent.$refs.editLayer.editing
        }
      },
      icao: function () {
        return this.$store.state.Editable.data.airport.icao
      },
      name: function () {
        return this.$store.state.Editable.data.airport.name
      },
      flights: function () {
        return this.$store.state.Editable.data.airport.flights
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
        return this.$store.state.Editable.data.airport.groundnet
      },
      parking: function () {
        return this.$store.state.Editable.data.airport.parking
      },
      airport: function () {
        return this.$store.state.Editable.type === 'airport'
      },
      Frequencies: {
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