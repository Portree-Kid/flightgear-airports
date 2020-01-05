<template>
  <div width="100%">
    <h1 class="leaflet-sidebar-header" v-if="airport">
        Airport 
      <div class="leaflet-sidebar-close">
          <i class="fa fa-caret-left"></i>
      </div>
    </h1>

    <div width="100%" v-if="airport">
      <div>
        <el-row>
          <el-col :span="7">ICAO :</el-col>
          <el-col :span="15">{{ this.$store.state.Editable.data.airports[this.$store.state.Editable.index].icao }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Name :</el-col>
          <el-col :span="15">{{ this.$store.state.Editable.data.airports[this.$store.state.Editable.index].name }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Flights :</el-col>
          <el-col :span="15">{{ this.$store.state.Editable.data.airports[this.$store.state.Editable.index].flights }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Airlines :</el-col>
          <el-col :span="15">{{ this.$store.state.Editable.data.airports[this.$store.state.Editable.index].airlines }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Groundnet :</el-col>
          <el-col :span="15">{{groundnet}}</el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script lang="js">
  export default {
    computed: {
      airport: function () {
        return this.$store.state.Editable.type === 'airport'
      },
      groundnet: function () {
        return this.$store.state.Editable.data.airports[this.$store.state.Editable.index].groundnet
      }
    }
  }
</script>
