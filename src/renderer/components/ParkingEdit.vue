<template>
  <div v-if="parking">
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
    <el-row>
      <el-col :span="7">
        <span class="demo-input-label">Size :</span>
      </el-col>
      <el-col :span="15">
        <el-radio-group v-model="radius">
          <el-tooltip content="PIPER PA-31/CESSNA 404 Titan" placement="bottom" effect="light">
            <el-radio :label="15">A</el-radio>
          </el-tooltip>
          <el-tooltip content="BOMBARDIER Regional Jet CRJ-200/DE HAVILLAND CANADA DHC-6" placement="bottom" effect="light">
            <el-radio :label="24">B</el-radio>
          </el-tooltip>
          <el-tooltip content="BOEING 737-700/AIRBUS A-320/EMBRAER ERJ 190-100" placement="bottom" effect="light">
            <el-radio :label="36">C</el-radio>
          </el-tooltip>
          <el-tooltip content="B767 Series/AIRBUS A-310" placement="bottom" effect="light">
            <el-radio :label="52">D</el-radio>
          </el-tooltip>
          <el-tooltip content="B777 Series/B787 Series/A330 Family" placement="bottom" effect="light">
            <el-radio :label="65">E</el-radio>
          </el-tooltip>
          <el-tooltip content="BOEING 747-8/AIRBUS A-380-800" placement="bottom" effect="light">
            <el-radio :label="80">F</el-radio>
          </el-tooltip>
        </el-radio-group>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="js">
  export default {
    computed: {
      parking: function () {
        return this.$store.state.Editable.type === 'parking'
      },
      name: {
      // getter
        get: function () {
          return this.$store.state.Editable.data.parking.name
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_NAME', newValue)
        }
      },
      radius: {
      // getter
        get: function () {
          return this.$store.state.Editable.data.parking.radius
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_RADIUS', newValue)
        }
      }
    }
  }
</script>
