<template>
    <el-dialog :title="title" :visible.sync="visible" width="30%" center>
      <span v-if="max>0">
        <el-progress :percentage="Number(((progress / max)*100).toPrecision(3))" v-if="max>0"></el-progress>
      </span>
      <span v-if="results.length>0" style="color: red">{{results.length}} Errors please correct first</span><br/>
      <span style="center">E-Mail : {{this.$store.state.Settings.settings.email}}</span><br/>
      <span style="center"><el-checkbox v-model="gplv2">I agree to release the groundnet under GPL v2</el-checkbox></span><br/>
      <span style="center" v-if="message">{{message}}</span><br/>
      <span style="error" v-if="error">{{message}}</span><br/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="upload" :disabled="!comittable">Ok</el-button>
      </span>
    </el-dialog>
</template>

<script lang="js">
/* eslint-disable */
  import Vue from 'vue'
  import fileUrl from 'file-url'
  import axios from 'axios'
  const fs = require('fs')
  const path = require('path')
  const mapper = require('../check/mapper');

  export default {
    name: 'upload',
    props: [],
    mounted () {
    },
    data () {
      return {
        gplv2: false, message: null, error: false, progress: 0, max: 0, azure: false
      }
    },
    methods: {
      reqListener(e) {
        if(JSON.parse(e.srcElement.response).status==='OK') {
          this.message = null;
          this.azure = true;
        } else {
          this.message = 'Azure down';
        }            

      },
      status () {
        var xhr = new XMLHttpRequest();
        this.message = 'Checking for Groundweb health'
        xhr.open('GET', 'http://groundweb.azurewebsites.net/groundnets/status', true);
        xhr.addEventListener("load", this.reqListener); 
        xhr.send();
      },
      upload () {
        var f = path.join(this.$store.state.Settings.settings.airportsDirectory, 
        this.icao[0], 
        this.icao[1], 
        this.icao[2], 
        this.icao + '.groundnet.new.xml');

        if (f == null || !fs.existsSync(f)) {
          this.message = 'File doesn\'t exist';
          return;
        }

        var data = fs.readFileSync(f, 'utf8').toString();
        var blob = new Blob([data]);
        var url = URL.createObjectURL(blob);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://groundweb.azurewebsites.net/groundnets/upload', true);

        // define new form
        var formData = new FormData();
        formData.append("gpl", this.gplv2 )
        formData.append("user_email", this.$store.state.Settings.settings.email)
        formData.append('groundnet', blob, this.icao + '.groundnet.xml');
        
        var parent = this.$parent;
        var messageField = this.message;
        // action after uploading happens
        xhr.onload = function(e) {
          console.log("File uploading completed! ");
          console.log(e);
          if (e.srcElement.status===500) {
            parent.$refs.upload.message == e.srcElement.statusText
          } else if(JSON.parse(e.srcElement.response).message.match('[A-Z0-9]* Imported Successfully')) {
            Vue.set(parent, 'uploadVisible', false)
            parent.$store.commit('UPLOAD_WIP', parent.$store.state.Airports.currentAirport.icao)
            
          } else if(JSON.parse(e.srcElement.response).message === 'XML Errors') {
            var response = JSON.parse(e.srcElement.response);
            if (response.validationErrors) {
              response.validationErrors.forEach(element => {
                parent.$refs.upload.message += element.message + '\r\n';
              });
            }
          } else if(JSON.parse(e.srcElement.response) !== undefined) {
            var response = JSON.parse(e.srcElement.response);
            parent.$refs.upload.message = response.err;
          } else {            
            parent.$refs.upload.message = response.message;
          }
        };
        this.message = "File uploading started!"

        // do the uploading
        console.log("File uploading started!");
        xhr.send(formData);
      },
      pollData () {
        var workery = this.worker
        var view = this
        workery.polling = setInterval(() => {
          if (workery != null) {
            view.max = Number(workery.max)
            view.progress = Number(workery.progress)
            view.scanning = Boolean(workery.checking)
            workery.view = view
          }
        }, 500)
      },
      check () {
        try {
          this.scanning = true
          const winURL = process.env.NODE_ENV === 'development'
            ? `http://localhost:9080/src/renderer/utils/check.js`
            : `file://${process.resourcesPath}/workers/check.js`
          console.log('make a check worker: ', path.resolve(__dirname, 'check.js'))

          const worker = new Worker(winURL)
          console.log(fileUrl('src/renderer/utils/check.js'))

          worker.checking = this.checking
          worker.max = this.max
          worker.view = this
          worker.editLayer = this.$parent.$parent.$refs.editLayer
          worker.progress = 0
          // var worker = new Worker(fileUrl('src/renderer/utils/worker.js'))
          this.worker = worker
          var groundnet = []

          this.$parent.$parent.$parent.$refs.editLayer.groundnetLayerGroup.eachLayer(l => {
            console.log(l)
          if (l instanceof L.Polyline) {
            l._latlngs[0].glueindex = this.begin;
            l._latlngs.slice(-1)[0].glueindex = this.end;
            l.extensions(this)
          }

            groundnet.push(l)
          })
          var features = groundnet.map(mapper.checkMapper).filter(n => n)
          var pavement = []
          this.$parent.$parent.$parent.$refs.pavementLayer.pavement.eachLayer(l => {
            console.log(l)
            pavement.push(l)
          })
          var features2 = pavement.map(mapper.checkMapper).filter(n => n)          

          worker.postMessage(['check', features.concat(features2) ] )
          this.pollData()
          // the reply
          var store = this.$store
          worker.onmessage = function (e) {
            if (e.data === 'checkStarted') {
              this.progress = 0
              this.max = 4
            } else if (e.data[0] === 'DONE') {
              console.log('DONE')
              store.dispatch('setResults', e.data[1])
              worker.terminate()
              worker.view.max = 0
              worker.view.checkDialogVisible = false
              clearInterval(this.polling)              
              this.checking = false
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
      }
    },
    computed: {
      visible: {
      // getter
        get: function () {
          return this.$attrs.visible
        },
        // setter
        set: function (newValue) {
          Vue.set(this.$parent, 'uploadVisible', newValue)
        }
      },
      title: function () {
        return `Upload ${this.$parent.$parent.$parent.icao} to groundweb.`
      },
      icao: {
        get: function () {
          return this.$parent.$parent.$parent.icao
        },
        set: function (newValue) {
        }
      },
      comittable: function () {
        return this.$store.state.Check.results.filter(a => a.id>=0).length === 0 && this.gplv2 && this.max === 0 && this.azure 
      },
      results: function () {
        return this.$store.state.Check.results.filter(a => a.id>=0)
      }

    }
}
</script>

<style scoped lang="scss">
  .center { text-align: center; vertical-align: middle;}
  .error { text-align: center; background-color: red;}
</style>
