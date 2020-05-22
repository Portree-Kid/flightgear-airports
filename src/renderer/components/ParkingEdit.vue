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
      <el-col :span="4">
        <span class="label">Name :</span>
      </el-col>
      <el-col :span="8">
        <el-input placeholder="Name" v-model="name" :disabled="!editing"></el-input>
      </el-col>
      <el-col :span="5">
        <span class="label">Number :</span>
      </el-col>
      <el-col :span="7">
        <el-input placeholder="Number" v-model="number" :disabled="!editing"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Size :</span>
      </el-col>
      <el-col :span="17">
        <!--
          * Cat Models                   FG Radii N2M Radii
          * B Small Regionals ERJ CRJ ATR    14       6
          * C A319 A320 A321 B737            18      10
          * D B757, B767                     26      15
          * E B777 B787 A330 A340 A360       33      24
          * F A380                           40      24
        -->

        <el-radio-group v-model="wingspan" :disabled="!editing">
          <el-tooltip content="PIPER PA-31/CESSNA 404 Titan" placement="top" effect="light">
            <el-radio :label="15">A</el-radio>
          </el-tooltip>
          <el-tooltip
            content="BOMBARDIER Regional Jet CRJ-200/DE HAVILLAND CANADA DHC-6"
            placement="top"
            effect="light"
          >
            <el-radio :label="28">B</el-radio>
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
            <el-radio :label="66">E</el-radio>
          </el-tooltip>
          <el-tooltip content="BOEING 747-8/AIRBUS A-380-800" placement="top" effect="light">
            <el-radio :label="80">F</el-radio>
          </el-tooltip>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Aircraft :</span>
      </el-col>
      <el-col :span="17">{{type}}</el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Coordinates :</span>
      </el-col>
      <el-col :span="17">
        <el-input placeholder="Please input" v-model="coordinates" :disabled="!editing"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Parking Type :</span>
      </el-col>
      <el-col :span="17">
        <el-select v-model="parking_type" placeholder="Select" :disabled="!editing">
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
        <span class="label">Airline :</span>
      </el-col>
      <el-col :span="17">
        <el-select v-model="airlineCodes" multiple placeholder="Select" :disabled="!editing">
          <el-option
            v-for="item in airlines"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Pushback Route End :</span>
      </el-col>
      <el-col :span="17">{{pushbackEnd}}</el-col>
    </el-row>
  </div>
</template>

<script lang="js">
/* eslint-disable */
  const convert = require('geo-coordinates-parser');
  const Coordinates = require('coordinate-parser');

  export default {
    methods: {
      show (idx) {
        this.$parent.$parent.$parent.$refs.editLayer.show(idx)
      }
    },
    computed: {
      editing: {
        get: function () {
          return this.$parent.$parent.$parent.$refs.editLayer.editing
        }
      },
      parking: function () {
        return this.$store.state.Editable.type === 'parking'
      },
      airlines: function () {
        var airlineCodes = [];
        var storedairlineCodes = this.$store.state.Airports.currentAirport.airlines;
        // return [{value: 'bi-directional', label: 'bi-directional'},
        //   {value: 'forward', label: 'forward'},
        //   {value: 'backward', label: 'backward'}
        // ]
        storedairlineCodes.forEach(element => {
          airlineCodes.push({value: element, label: element});
        });
        return airlineCodes
      },
      airlineCodes: {
      // getter
        get: function () {          
          var codes = this.$store.state.Editable.data.parking.airlineCodes
          if (Array.isArray(codes)) {
            return codes
          } else if (codes !== undefined && codes instanceof String) {
            return codes.split(',')            
          } else {
            return []
          }
          return 
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_AIRLINES', newValue)
        }
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
      number: {
      // getter
        get: function () {
          return this.$store.state.Editable.data.parking.number
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_NUMBER', newValue)
        }
      },
      coordinates: {
      // getter
        get: function () {
          if(this.$store.state.Editable.index!==undefined) {
            var ret = this.$parent.$parent.$parent.$refs.editLayer.getPointCoords(this.$store.state.Editable.index)
            return ret[0].lat + " " + ret[0].lng
          }
        },
        // setter
        set: function (newValue) {          
          var position = new Coordinates(newValue);
          console.log(position);          
          this.$parent.$parent.$parent.$refs.editLayer.setPointCoords(this.$store.state.Editable.index, position)
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
/**
 * Cat Models                   FG Radii N2M Radii
 * B Small Regionals ERJ CRJ ATR    14       6
 * C A319 A320 A321 B737            18      10
 * D B757, B767                     26      15
 * E B777 B787 A330 A340 A360       33      24
 * F A380                           40      24
 */

        switch (this.$store.state.Editable.data.parking.radius * 2) {
          case 15:
            return 'PIPER PA-31/CESSNA 404 Titan'
          case 28:
            return 'BOMBARDIER Regional Jet CRJ-200/DE HAVILLAND CANADA DHC-6'
          case 36:
            return 'BOEING 737-700/AIRBUS A-320/EMBRAER ERJ 190-100'
          case 52:
            return 'B767 Series/AIRBUS A-310'
          case 66:
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
          {value: 'mil-cargo', label: 'military cargo'}
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

<style>
.el-row {
  margin: 1px;
}
.el-col {
  padding-left: 2pt;
}
.label {
  display: flex;
  justify-content: left;
  align-items: center;
  font-weight: bold;
}
</style>
