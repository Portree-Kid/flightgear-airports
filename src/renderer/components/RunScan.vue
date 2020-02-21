<template>
  <div>
    <h1 class="leaflet-sidebar-header">
      Scanning
      <div class="leaflet-sidebar-close">
        <i class="fa fa-caret-left"></i>
      </div>
    </h1>
    <el-container direction="vertical">
      <el-progress :percentage="Number(((progress / max)*100).toPrecision(3))" v-if="max>0"></el-progress>
      <!--<el-progress :percentage="progress / max"></el-progress>-->
      <!--{{max}}&nbsp;{{progress}}-->

      <el-button @click="scanAPT()" :disabled="scanning">Scan APT File</el-button>
      <el-button @click="scanGroundnets()" :disabled="scanning">Scan Groundnet Files</el-button>
      <el-button @click="scanTraffic()" :disabled="scanning">Scan Traffic Files</el-button>
    </el-container>
  </div>
</template>

<script lang="js">
  // import scanner from '../utils/scan'
  import fileUrl from 'file-url'
  import {Table, TableColumn} from 'element-ui'
  // import Vue from 'vue'

  const path = require('path')

  export default {
    name: 'run-scan',
    components: { [Table.name]: Table,
      [TableColumn.name]: TableColumn},
    props: [],
    mounted () {
    },
    beforeDestroy () {
      if (this.polling != null) {
        clearInterval(this.polling)
      }
    },
    data () {
      // this.$store.dispatch('getAirportsUnfiltered')
      return {
        max: 0,
        progress: 0,
        scanning: false,
        polling: null,
        worker: null
      }
    },
    methods: {
      pollData () {
        var workery = this.worker
        var view = this
        workery.polling = setInterval(() => {
          if (workery != null) {
            view.max = Number(workery.max)
            view.progress = Number(workery.progress)
            view.scanning = Boolean(workery.scanning)
            workery.view = view
          }
        }, 1000)
      },
      scanAPT () {
        try {
          this.scanning = true
          const winURL = process.env.NODE_ENV === 'development'
            ? `http://localhost:9080/src/renderer/utils/worker.js`
            : `file://${__dirname}/worker.js`
          console.log('make a worker: ', path.resolve(__dirname, 'worker.js'))

          const worker = new Worker(winURL)
          console.log(fileUrl('src/renderer/utils/worker.js'))

          worker.scanning = this.scanning
          worker.max = this.max
          worker.progress = 0
          // var worker = new Worker(fileUrl('src/renderer/utils/worker.js'))
          this.worker = worker
          worker.postMessage(['scanapt', this.$store.state.Settings.settings.flightgearDirectory_apt])
          this.pollData()
          // the reply
          var store = this.$store
          worker.onmessage = function (e) {
            if (e.data === 'scanStarted') {
              this.progress = 0
              this.max = 0
            } else if (e.data === 'DONE') {
              console.log('DONE')
              store.dispatch('getAirports')
              worker.terminate()
              worker.view.max = 0
              worker.view.scanning = false
              clearInterval(this.polling)
              this.scanning = false
            } else if (e.data.length > 0) {
              if (e.data[0] === 'max') {
                this.max = e.data[1]
              }
              if (e.data[0] === 'progress') {
                this.progress += e.data[1]
              }
            }
            // console.log(e.data)
          }
        } catch (err) {
          console.error(err)
        }
      },
      scanGroundnets () {
        try {
          this.scanning = true
          const winURL = process.env.NODE_ENV === 'development'
            ? `http://localhost:9080/src/renderer/utils/worker.js`
            : `file://${__dirname}/worker.js`
          console.log('make a worker: ', path.resolve(__dirname, 'worker.js'))

          const worker = new Worker(winURL)
          console.log(fileUrl('src/renderer/utils/worker.js'))

          worker.scanning = this.scanning
          worker.max = this.max
          worker.progress = 0

          this.worker = worker
          worker.postMessage(['scan', this.$store.state.Settings.settings.airportsDirectory])
          this.pollData()
          // the reply
          var store = this.$store
          worker.onmessage = function (e) {
            if (e.data === 'scanStarted') {
              this.progress = 0
              this.max = 0
            } else if (e.data === 'DONE') {
              console.log('DONE')
              store.dispatch('getAirports')
              worker.terminate()
              worker.view.max = 0
              worker.view.scanning = false
              clearInterval(this.polling)
              this.scanning = false
            } else if (e.data.length > 0) {
              if (e.data[0] === 'max') {
                this.max = e.data[1]
              }
              if (e.data[0] === 'progress') {
                this.scanning = false
                this.progress += e.data[1]
              }
            }
            // console.log(e.data)
          }
        } catch (err) {
          console.error(err)
        }
      },
      scanTraffic () {
        // let flightgearDirectory = this.$store.state.settings.flightgearDirectory
        try {
          this.scanning = true
          const winURL = process.env.NODE_ENV === 'development'
            ? `http://localhost:9080/src/renderer/utils/worker.js`
            : `file://${__dirname}/worker.js`
          console.log('make a worker: ', path.resolve(__dirname, 'worker.js'))

          const worker = new Worker(winURL)
          console.log(fileUrl('src/renderer/utils/worker.js'))
          this.scanning = true
          worker.scanning = this.scanning
          worker.max = this.max
          worker.progress = this.progress
          this.worker = worker
          worker.postMessage(['scanai', this.$store.state.Settings.settings.flightgearDirectory_traffic])
          this.pollData()
          // the reply
          var store = this.$store
          worker.onmessage = function (e) {
            if (e.data === 'scanStarted') {
              this.progress = 0
              this.max = 0
            } else if (e.data === 'DONE') {
              this.scanning = false
              console.log('DONE')
              store.dispatch('getAirports')
              worker.view.max = 0
              worker.view.scanning = false
              worker.terminate()
              clearInterval(this.polling)
            } else if (e.data.length > 0) {
              if (e.data[0] === 'max') {
                this.max = e.data[1]
              }
              if (e.data[0] === 'progress') {
                this.progress += e.data[1]
              }
            }
            // console.log(e)
          }
        } catch (err) {
          console.error(err)
        }
      }
    },
    computed: {
    }
}
</script>
<style>
.el-button+.el-button {
    margin-left: 0px;
}
</style>
