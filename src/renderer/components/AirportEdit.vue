<template>
  <div>
    <div width="100%" v-if="airport">
        <el-row>
          <el-col :span="7">ICAO :</el-col>
          <el-col :span="15">{{ icao }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Name :</el-col>
          <el-col :span="15">{{ name }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Flights :</el-col>
          <el-col :span="15">{{ flights }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Airlines :</el-col>
          <el-col :span="15">{{ airlines }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Groundnet :</el-col>
          <el-col :span="15">{{groundnet}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Parking Positions :</el-col>
          <el-col :span="15">{{ parking }}</el-col>
        </el-row>
    </div>
    <el-divider  v-if="airport"></el-divider>  
    <h3 v-if="airport">Frequencies</h3>  
    <div v-if="airport">
        <el-row v-for="f in Frequencies" :key="f.index">
          <Frequency :frequency="f"></Frequency>
        </el-row>
    </div>
    <el-button @click="addFrequency" v-if="editing" >Add</el-button>
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
      editing: function () {
        return this.$parent.$parent.$parent.$refs.editLayer !== undefined &&
        this.$parent.$parent.$parent.$refs.editLayer.editing &&
        this.$store.state.Editable.type === 'airport'
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
        return this.$store.state.Editable.data.airport.airlines
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
     padding: 0em
   }
</style>