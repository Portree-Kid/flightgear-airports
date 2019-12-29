<template>
  <div id="panel" width="100%">
  <div id="panel" width="100%"  v-if="airport">
    <h1 class="leaflet-sidebar-header">
      Airports
      <div class="leaflet-sidebar-close">
        <i class="fa fa-caret-left"></i>
      </div>
    </h1>
    <el-row>
      <el-col :span="7">ICAO : </el-col>
      <el-col :span="15">{{ this.$store.state.Editable.data.properties.icao }}</el-col>
    </el-row>
    <el-row>
      <el-col :span="7">Name : </el-col>
      <el-col :span="15">{{ this.$store.state.Editable.data.properties.name }}</el-col>
    </el-row>
    <el-row>
      <el-col :span="7">Flights : </el-col>
      <el-col :span="15">{{ this.$store.state.Editable.data.properties.flights }}</el-col>
    </el-row>
    <el-row>
      <el-col :span="7">Airlines : </el-col>
      <el-col :span="15">{{ this.$store.state.Editable.data.properties.airlines }}</el-col>
    </el-row>
  </div>
  </div>
</template>

<script lang="js">
  export default {
    computed: {
      airport: function () {
        return this.$store.state.Editable.type === 'airport'
      },
      airports_directory: function () {
        return this.$store.state.Settings.settings.airportsDirectory
      }
    }
  }
</script>
