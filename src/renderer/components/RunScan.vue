<template>
  <div>
    <el-container direction='vertical'>      
    <el-button @click="scanAPT()">Scan APT File</el-button>
    <el-button @click="scanGroundnets()">Scan Groundnet Files</el-button>
    <el-button @click="scanTraffic()">Scan Traffic Files</el-button>
    </el-container>      
  </div>
</template>

<script lang="js">
  // import scanner from '../utils/scan'
  import fileUrl from 'file-url'

  const path = require('path')

  export default {
    name: 'run-scan',
    components: {},
    props: [],
    mounted () {
    },
    beforeDestroy () {
    },
    data () {
      return {
      }
    },
    methods: {
      scanAPT () {
        try {
          const winURL = process.env.NODE_ENV === 'development'
            ? `http://localhost:9080/src/renderer/utils/worker.js`
            : `file://${__dirname}/worker.js`
          console.log('make a worker: ', path.resolve(__dirname, 'worker.js'))

          const worker = new Worker(winURL)
          console.log(fileUrl('src/renderer/utils/worker.js'))

          // var worker = new Worker(fileUrl('src/renderer/utils/worker.js'))
          worker.postMessage('scanapt')
          // the reply
          worker.onmessage = function (e) {
            if (e.data === 'DONE') {
              console.log('DONE')
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

          // var worker = new Worker(fileUrl('src/renderer/utils/worker.js'))
          worker.postMessage('scan')
          // the reply
          worker.onmessage = function (e) {
            if (e.data === 'DONE') {
              console.log('DONE')
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

          // var worker = new Worker(fileUrl('src/renderer/utils/worker.js'))
          worker.postMessage('scanai')
          // the reply
          worker.onmessage = function (e) {
            if (e.data === 'DONE') {
              console.log('DONE')
            }
            console.log(e.data)
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
