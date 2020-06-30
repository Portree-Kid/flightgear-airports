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
  <!--    
    <el-row>
      <el-col :span="4">
        <span class="label">Name :</span>
      </el-col>
      <el-col :span="8">
        <el-input placeholder="Name" v-model="name" :disabled="!editing"></el-input>
      </el-col>
    </el-row>
    -->
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
        <el-radio-group v-model="wingspan" :disabled="!editing" @change="wingspanChange">
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
      <el-col :span="17" class="value">{{type}}</el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Heading :</span>
      </el-col>
      <el-col :span="17">
        <el-input-number
          v-model="avgHeading" @change="headingChange"
          :min="-361"
          :max="720"
          :step="0.1"
          :precision="1"
          :disabled="!editing"
        ></el-input-number>
      </el-col>
    </el-row>
    <!--
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
            :disabled="type.disabled"
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
    -->
  </div>
</template>

<script lang="js">
/* eslint-disable */
  import Vue from 'vue'  

const convert = require('geo-coordinates-parser');
  const Coordinates = require('coordinate-parser');

  export default {    
    data () {
      return {
        data: Object, avgHeading: 5, editing: Boolean, wingspan: 0
      }
    },

    methods: {
      show (idx) {
        this.$parent.$parent.$parent.$refs.editLayer.show(idx)
      }, 
      setData (data) {
        this.data = data;
        this.setAvgHeading();
      },
      setEditing(editing) {
        this.editing = editing
      },
      setAvgHeading() {
          if( this.data === null || this.data === undefined) {
            return 0
          }          
          this.avgHeading = Number( this.data.reduce(function (r, parking) {
            r.sum = r.sum + parking.options.attributes.heading;
            r.avg = r.sum / ++r.count;
           return r;
          }, { sum: 0, count: 0, avg: 0 }).avg);        
      }, 
      wingspanChange( newValue ) {
          if ( newValue ) {
            this.$emit('edit', {type: 'parking-group-wingspan', wingspan: newValue} )
          }
      }, 
      headingChange( newValue ) {
          while (newValue>=360) {
            newValue -= 360
          }
          while (newValue<0) {
            newValue += 360
          }
          if ( newValue ) {
            this.$emit('edit', {type: 'parking-group-angle', angle: newValue} )
          }
      }
    },
    computed: {      
      parking: function () {
        return this.data !== null && this.$store.state.Editable.type === 'parking-group'

      },
      airlines: function () {
        var airlineCodes = [];
        var storedairlineCodes = this.$store.state.Airports.currentAirport.airlines;
        // return [{value: 'bi-directional', label: 'bi-directional'},
        //   {value: 'forward', label: 'forward'},
        //   {value: 'backward', label: 'backward'}
        // ]
        if(storedairlineCodes) {
          storedairlineCodes.forEach(element => {
            airlineCodes.push({value: element, label: element});
          });
        }
        return airlineCodes
      },
      airlineCodes: {
      // getter
        get: function () {          
        },
        // setter
        set: function (newValue) {
        }
      },
      name: {
      // getter
        get: function () {
       },
        // setter
        set: function (newValue) {
        }
      },
      number: {
      // getter
        get: function () {
        },
        // setter
        set: function (newValue) {
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

        switch (this.wingspan) {
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
            return 'Unknown radius : ' + this.wingspan
        }
      },
      // ga (general aviation), cargo (cargo), gate (commercial passenger traffic),
      // mil-fighter (military fighter), mil-cargo (military transport)
      options: function () {
        return [{value: 'none', label: 'none', disabled: true},
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
.value {
  display: flex;
  justify-content: left;
  align-items: center;
}
.el-popover--plain {
  padding: 10px 10px;
}
.el-popover__title {
  display: none;
}
</style>
