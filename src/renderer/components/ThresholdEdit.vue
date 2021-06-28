<!--
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->

<template>
  <div width="100%" v-if="threshold">
    <div>
      <el-row>
        <el-col :span="7">
          <span class="label">Runway :</span>
        </el-col>
        <el-col :span="17">
          <el-input
            placeholder="Please input"
            v-model="runway"
            :disabled="true"
          ></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="7">
          <span class="label">Displacement :</span>
        </el-col>
        <el-col :span="17">
          <el-input-number
            v-model="displacement"
            :disabled="!editing"
          ></el-input-number>
        </el-col>
      </el-row>
    </div>
  </div>
</template>


<script lang="js">
/* eslint-disable */
  const Coordinates = require('coordinate-parser');
  import {writeTowerXML} from '../loaders/tower_writer'


  export default {
    /*
    methods: {
      updateIsOnRunway (value) {
        this.$store.commit('SET_EDIT_ISONRUNWAY', value)
      }
    },
    */
    data () {
      return {
        coordFocussed: false
      }
    },
    methods: {
      save () {
        var o = {latitude: this.latitude, longitude: this.longitude, height: this.height};
        writeTowerXML(this.$store.state.Settings.settings.airportsDirectory, this.$parent.$parent.$parent.icao, o)
      }
    },
    computed: {
      editing: {
        get: function () {
          return this.$parent.$parent.$parent.$refs.editLayer.editing 
        }
      },
      threshold: function () {
        return this.$store.state.Editable.type === 'threshold'
      },
      //<rwy>07L</rwy>
      //<hdg-deg>68.77</hdg-deg>
      //<displ-m>0.0</displ-m>
      //<stopw-m>160.0</stopw-m>
      runway: function () {
        return this.$store.state.Editable.data.threshold.runway;
      },
      displacement: {
        set: function (newValue) {
          this.$store.dispatch('setDisplacement', newValue);
        },
        get: function () {
        return this.$store.state.Editable.data.threshold.displacement;
      }
      }
    }
  }
</script>
