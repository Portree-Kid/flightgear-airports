<template>
  <div>
    <h1 class="leaflet-sidebar-header" v-if="arc">
      Arc Properties
      <div class="leaflet-sidebar-close">
        <i class="fa fa-caret-left"></i>
      </div>
    </h1>
    <div width="100%" v-if="arc">
      <div>
        <!--
          airlineCodes: 0
          heading: 341.34
          index: 13
          lat: "N59 52.610885"
          lon: "W1 17.855144"
          name: "Western_Apron_Hanger"
          pushBackRoute: 27
          radius: 18
          type: "gate"
        -->
        <el-row>
          <el-col :span="7">
            <span class="demo-input-label">Name :</span>
          </el-col>
          <el-col :span="15">
            <el-input placeholder="Please input" v-model="name"></el-input>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script lang="js">
  export default {
    computed: {
      arc: function () {
        return this.$store.state.Editable.type === 'arc'
      },
      name: {
      // getter
        get: function () {
          return this.$store.state.Editable.data.name
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_NAME', newValue)
        }
      },
      airports_directory: function () {
        return this.$store.state.Settings.settings.airportsDirectory
      }
    }
  }
</script>
