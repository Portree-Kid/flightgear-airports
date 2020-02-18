<template>
  <div>
    <h1 class="leaflet-sidebar-header">
      Search
      <div class="leaflet-sidebar-close">
        <i class="fa fa-caret-left"></i>
      </div>
    </h1>
    <el-container direction="vertical">
      <el-input placeholder="Search" v-model="searchterm" class="input-with-select">
      </el-input>
    </el-container>
    <li v-for="item in searched" v-bind:key="item.icao"><el-link type="primary" @click="goto(item.icao)">{{ item.icao }} {{ item.name }}</el-link></li>
  </div>
</template>

<script lang="js">
  // import scanner from '../utils/scan'
  import fileUrl from 'file-url'
  import {Table, TableColumn} from 'element-ui'

  const path = require('path')

  export default {
    name: 'search',
    components: { [Table.name]: Table,
      [TableColumn.name]: TableColumn},
    props: [],
    mounted () {
    },
    beforeDestroy () {
    },
    data () {
      // this.$store.dispatch('getAirportsUnfiltered')
      return {searchterm: this.searchterm}
    },
    methods: {
      goto (icao) {
        console.log(icao)
        let airports = this.$store.state.Airports.airports
          .filter(a => a.properties.icao.match(icao))
        if (airports.length > 0) {
          this.$store.commit('CENTER', [airports[0].geometry.coordinates[1], airports[0].geometry.coordinates[0]])
        }
      },
      formatter (row, column) {
        console.log('Row ' + row)
        return row
      },
      scanAPT () {
        try {
          const winURL = process.env.NODE_ENV === 'development'
            ? `http://localhost:9080/src/renderer/utils/worker.js`
            : `file://${__dirname}/worker.js`
          console.log('make a worker: ', path.resolve(__dirname, 'worker.js'))

          const worker = new Worker(winURL)
          console.log(fileUrl('src/renderer/utils/worker.js'))

          // var worker = new Worker(fileUrl('src/renderer/utils/worker.js'))
          worker.postMessage(['scanapt'])
          // the reply
          var store = this.$store
          worker.onmessage = function (e) {
            if (e.data === 'DONE') {
              console.log('DONE')
              store.dispatch('getAirports')
              worker.terminate()
            }
            console.log(e.data)
          }
        } catch (err) {
          console.error(err)
        }
      },
      scanGroundnets () {
        try {
          const winURL = process.env.NODE_ENV === 'development'
            ? `http://localhost:9080/src/renderer/utils/worker.js`
            : `file://${__dirname}/worker.js`
          console.log('make a worker: ', path.resolve(__dirname, 'worker.js'))

          const worker = new Worker(winURL)
          console.log(fileUrl('src/renderer/utils/worker.js'))

          worker.postMessage(['scan', this.$store.state.Settings.settings.airportsDirectory])
          // the reply
          var store = this.$store
          worker.onmessage = function (e) {
            if (e.data === 'DONE') {
              console.log('DONE')
              store.dispatch('getAirports')
              worker.terminate()
            }
            console.log(e.data)
          }
        } catch (err) {
          console.error(err)
        }
      },
      scanTraffic () {
        // let flightgearDirectory = this.$store.state.settings.flightgearDirectory
        try {
          const winURL = process.env.NODE_ENV === 'development'
            ? `http://localhost:9080/src/renderer/utils/worker.js`
            : `file://${__dirname}/worker.js`
          console.log('make a worker: ', path.resolve(__dirname, 'worker.js'))

          const worker = new Worker(winURL)
          console.log(fileUrl('src/renderer/utils/worker.js'))
          worker.postMessage(['scanai', this.$store.state.Settings.settings.flightgearDirectory])
          // the reply
          var store = this.$store
          worker.onmessage = function (e) {
            if (e.data === 'DONE') {
              console.log('DONE')
              store.dispatch('getAirports')
              worker.terminate()
            }
            console.log(e.data)
          }
        } catch (err) {
          console.error(err)
        }
      }
    },
    computed: {
      searched: function () {
        console.log(this.searchterm)
        let searchRegex = new RegExp(this.searchterm, 'i')
        return this.$store.state.Airports.airports
          .filter(a => searchRegex.test(a.properties.icao) || searchRegex.test(a.properties.name))
          // .map(a => console.log(a.properties))
          .map(a => ({ icao: a.properties.icao, name: a.properties.name }))
      }
    }
}
</script>
