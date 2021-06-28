<!--
Copyright 2021 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->
<template>
  <div>
    <el-radio-group v-model="direction">
      <el-radio :label="departure"
        ><i class="fas fa-plane-departure"></i
      ></el-radio>
      <el-radio :label="arrival"><i class="fas fa-plane-arrival"></i></el-radio>
    </el-radio-group>
    <el-collapse v-model="activeName" accordion ref="collapse">
      <el-collapse-item
        v-for="a in airlines"
        v-bind:key="a.index"
        class="row"
        :title="a.label"
        :name="a.label"
      >
        <AirlineItem :airline="a" ref="airline"></AirlineItem>
      </el-collapse-item>
    </el-collapse>
    <el-popover
      placement="top-start"
      title="Add Test Traffic"
      width="200"
      trigger="hover"
      content="Generate Testtraffic"
    >
      <el-button @click="generate" class="button" slot="reference">
        <i class="fas fa-notes-medical"></i>
      </el-button>
    </el-popover>
  </div>
</template>

<script lang="js">
  import AirlineItem from './AirlineItem'
  import {writeTrafficXML} from '../loaders/traffic_writer'

  export default {
    name: 'traffic-list',
    components: {AirlineItem},
    props: [],
    data () {
      return {
        activeName: '',
        departure: 0,
        arrival: 1,
        direction: 0,
        activeIndex: '1',
        activeIndex2: '1'
      }
    },
    methods: {
      generate () {
        // .filter((f) => f.$children[0])
        var aircraft = this.$refs.airline.flatMap((f) => {
          console.debug(f.aircraft)
          return f.aircraft
        }
        ).filter(f => f)

        writeTrafficXML(this.$store.state.Settings.settings.flightgearDirectory_traffic, this.$store.state.Parkings.items, aircraft)
      }
    },
    computed: {
      airlines: function () {
        var airlineCodes = []
        if (this.$store.state.Airports.currentAirport !== undefined && this.$store.state.Airports.currentAirport.airlines) {
          var storedairlineCodes = this.$store.state.Airports.currentAirport.airlines
          storedairlineCodes.forEach(element => {
            airlineCodes.push({value: element, label: element})
          })
        }
        return airlineCodes.filter((v, i, a) => a.indexOf(v) === i)
      }
    }
}
</script>

<style>
div.row.div {
  display: flex;
  justify-content: space-between;
}
</style>


