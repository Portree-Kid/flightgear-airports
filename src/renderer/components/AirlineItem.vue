<!--
Copyright 2021 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->
<template>
  <div>
    <div v-for="item in traffic" v-bind:key="item.id">
      <div v-if="direction == 0">{{ item.departure.time }} {{ item.callsign }} {{ item.departure.port }} --> {{ item.arrival.port }}</div>
      <div v-if="direction == 1">{{ item.arrival.time }} {{ item.callsign }} {{ item.departure.port }} --> {{ item.arrival.port }}</div>

    </div>
  </div>
</template>

<script lang="js">
  import {readTrafficXML} from '../loaders/traffic_loader'
  import ParkingItem from './ParkingItem'
  const fs = require('fs')
  const path = require('path')

export default {
    name: 'airline-traffic',
    components: {ParkingItem},
    props: {airline: Object},
    data () {
      return {}
    },
    methods: {
      traverseDir (dir, airline) {
        var result = []
        if (!fs.existsSync(dir)) {
          return result
        }
        var iaco = airline.label
        fs.readdirSync(dir).forEach(file => {
          let fullPath = path.join(dir, file)
          if (fs.lstatSync(fullPath).isDirectory()) {
            var children = this.traverseDir(fullPath, airline)
            result = result.concat(children)
          } else {
            if (file.match(new RegExp(`${iaco}.xml`, 'i'))) {
              result.push(fullPath)
            }
          }
        })
        return result
      }
    },
    computed: {
      direction: function () {
        return this.$parent.$parent.$parent.$data.direction
      },
      filename: function () {
        var ret = this.traverseDir(this.$store.state.Settings.settings.flightgearDirectory_traffic, this.airline)
        if (ret.length > 0) {
          return ret[0]
        }
      },
      trafficFile: function () {
        return readTrafficXML(this.filename)
      },
      traffic: function () {
        if (this.filename) {
          return this.trafficFile.filter(f => f.callsign).filter(f =>
            (f.departure.port === this.$store.state.Airports.currentAirport.icao && this.direction === 0) ||
            (f.arrival.port === this.$store.state.Airports.currentAirport.icao && this.direction === 1)
          )
        }
        console.debug(this.filename)
      },
      aircraft: function () {
        if (this.filename) {
          return this.trafficFile.filter(f => f.registration)
        }
        console.debug(this.filename)
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


