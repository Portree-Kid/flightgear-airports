<template>
    <div width="100%" v-if="airport">
      <div>
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
    </div>
</template>

<script lang="js">
  export default {
    computed: {
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
      }
    }
  }
</script>

<style lang="scss" scoped>
   .el-row {
     padding: 0em
   }
</style>