<!--
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->
<template>
    <div width="100%" v-if="multiarc">
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
            <span class="demo-input-label">Pushback :</span>
          </el-col>
          <el-col :span="15">
            <el-switch v-model="isPushback"></el-switch>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="7">
            <span class="demo-input-label">Direction :</span>
          </el-col>
          <el-col :span="15">
            <el-select v-model="direction" placeholder="Select">
              <el-option
                v-for="type in options"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              ></el-option>
            </el-select>
          </el-col>
        </el-row>
    </div>
</template>

<script lang="js">
  export default {
    computed: {
      multiarc: function () {
        return this.$store.state.Editable.type === 'multiarc'
      },
      // ga (general aviation), cargo (cargo), gate (commercial passenger traffic),
      // mil-fighter (military fighter), mil-cargo (military transport)
      options: function () {
        return [{value: 'bi-directional', label: 'bi-directional'},
          {value: 'forward', label: 'forward'},
          {value: 'backward', label: 'backward'}
        ]
      },
      name: {
      // getter
        get: function () {
          return this.$store.state.Editable.data.multiarc.name
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_ARC_NAME', newValue)
        }
      },
      isPushback: {
      // getter
        get: function () {
          return this.$store.state.Editable.data.multiarc.isPushBackRoute === '1' ||
          Number(this.$store.state.Editable.data.multiarc.isPushBackRoute) === Number(1)
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PUSHBACK', newValue ? '1' : '0')
        }
      },
      direction: {
      // getter
        get: function () {
          return this.$store.state.Editable.data.multiarc.direction
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_DIRECTION', newValue)
        }
      }
    }
  }
</script>
