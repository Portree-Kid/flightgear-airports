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
        <el-radio-group v-model="wingspan">
          <el-tooltip content="PIPER PA-31/CESSNA 404 Titan" placement="top" effect="light">
            <el-radio :label="15">A</el-radio>
          </el-tooltip>
          <el-tooltip
            content="BOMBARDIER Regional Jet CRJ-200/DE HAVILLAND CANADA DHC-6"
            placement="top"
            effect="light"
          >
            <el-radio :label="24">B</el-radio>
          </el-tooltip>
          <el-tooltip
            content="BOEING 737-700/AIRBUS A-320/EMBRAER ERJ 190-100"
            placement="top"
            effect="light"
          >
            <el-radio :label="36">C</el-radio>
          </el-tooltip>
          <el-tooltip content="B767 Series/AIRBUS A-310" placement="top" effect="light">
            <el-radio :label="52">D</el-radio>
          </el-tooltip>
          <el-tooltip content="B777 Series/B787 Series/A330 Family" placement="top" effect="light">
            <el-radio :label="65">E</el-radio>
          </el-tooltip>
          <el-tooltip content="BOEING 747-8/AIRBUS A-380-800" placement="top" effect="light">
            <el-radio :label="80">F</el-radio>
          </el-tooltip>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="demo-input-label">Aircraft :</span>
      </el-col>
      <el-col :span="15">{{type}}</el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="demo-input-label">Parking Type :</span>
      </el-col>
      <el-col :span="15">
        <el-select v-model="parking_type" placeholder="Select">
          <el-option
            v-for="type in options"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          ></el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="demo-input-label">Pushback Route End :</span>
      </el-col>
      <el-col :span="15">{{pushbackEnd}}</el-col>
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
      wingspan: {
      // getter
        get: function () {
          return this.$store.state.Editable.data.parking.radius * 2
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_RADIUS', newValue / 2)
        }
      },
      pushbackEnd: function () {
        return this.$parent.$parent.$parent.$refs.editLayer.findRouteToPushback(this.$store.state.Editable.index)
      },
      type: function () {
        switch (this.$store.state.Editable.data.parking.radius * 2) {
          case 15:
            return 'PIPER PA-31/CESSNA 404 Titan'
          case 24:
            return 'BOMBARDIER Regional Jet CRJ-200/DE HAVILLAND CANADA DHC-6'
          case 36:
            return 'BOEING 737-700/AIRBUS A-320/EMBRAER ERJ 190-100'
          case 52:
            return 'B767 Series/AIRBUS A-310'
          case 65:
            return 'B777 Series/B787 Series/A330 Family'
          case 80:
            return 'BOEING 747-8/AIRBUS A-380-800'
          default:
            return 'Unknown radius : ' + this.$store.state.Editable.data.parking.radius
        }
      },
      // ga (general aviation), cargo (cargo), gate (commercial passenger traffic),
      // mil-fighter (military fighter), mil-cargo (military transport)
      options: function () {
        return [{value: 'none', label: 'none'},
          {value: 'ga', label: 'general aviation'},
          {value: 'cargo', label: 'cargo'},
          {value: 'gate', label: 'commercial passenger traffic'},
          {value: 'mil-fighter', label: 'military fighter'},
          {value: 'mil-cargo', label: 'commercial passenger traffic'}
        ]
      },
      parking_type: {
      // getter
        get: function () {
          if (this.$store.state.Editable.data.parking.type === undefined) {
            return 'none'
          }
          return this.$store.state.Editable.data.parking.type
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_TYPE', newValue)
        }
      }
    }
  }
</script>
