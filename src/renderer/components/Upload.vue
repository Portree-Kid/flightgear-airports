<!--
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->

<template>
    <el-dialog :title.sync="title" :visible.sync="visible" width="30%" center>
      <span v-if="max>0">
        <el-progress :percentage="Number(((progress / max)*100).toPrecision(3))" v-if="max>0"></el-progress>
      </span>
      <span v-if="results.length>0" style="color: red">{{results.length}} Errors please correct first</span><br/>
      <span class="center">E-Mail : {{this.$store.state.Settings.settings.email}}</span><br/>
      <span class="center"><el-checkbox v-model="gplv2" class="center">I agree to release the groundnet under GPL v2</el-checkbox></span><br/>
      <span :class="textClass" v-if="message">{{message}}</span><br/>
      
      <el-button @click="handleOkClicked('twr')" :disabled="!tower_comittable" >Upload Tower</el-button>
      <el-button @click="handleOkClicked('groundnet')" :disabled="!groundnet_comittable" >Upload Groundnet</el-button>
      <el-button @click="handleOkClicked('threshold')" :disabled="!threshold_comittable" >Upload Threshold</el-button>

      <span slot="footer" class="dialog-footer">
        <el-button @click="closeClicked">{{buttonText}}</el-button>
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
      this.$store.watch(
        function (state) {
          return state.Loading.groundnetLoaded;
        },
              () => { if(this.$store.state.Loading.groundnetLoaded && 
              this.$store.state.Loading.pavementLoaded && 
              this.visible) this.check() }
              ,
              {
                deep: false
              }
        );
      this.$store.watch(
        function (state) {
          return state.Loading.pavementLoaded;
        },
              () => { if(this.$store.state.Loading.groundnetLoaded && 
              this.$store.state.Loading.pavementLoaded && 
              this.visible) this.check() }
              ,
              {
                deep: false
              }
        );

    },
    data () {
      return {
        gplv2: false, message: null, error: false, progress: 0, max: 0, azure: false, success: false, uploading: false, buttonText: 'Ok'
      }
    },
    methods: {
      reqListener(e) {
        if(JSON.parse(e.srcElement.response).status==='OK') {
          this.message = null;
          this.azure = true;
          this.error = false;
        } else {
          this.message = 'Azure down';
        }            

      },
      status () {
        this.azure = false;
        var xhr = new XMLHttpRequest();
        var parent = this.$parent;

        this.message = 'Checking for Groundweb health'
        xhr.open('GET', 'http://groundweb.azurewebsites.net/groundnets/status', true);
        xhr.onreadystatechange = function () {
  	    	if (xhr.status !== 200){
            parent.$refs.upload.message = 'Azure down';
            parent.$refs.upload.error = true;
            console.error(xhr);                      
	       	}
	      }
        xhr.addEventListener("load", this.reqListener); 
        try {
          xhr.send();          
        } catch (err) {
          console.error(err);
          this.error = true;          
        }
      },
      closeClicked () {
        Vue.set(this.$parent, 'uploadVisible', false)
        return;
      },
      handleOkClicked (type) {
        this.uploading = true;
        var f = path.join(this.$store.state.Settings.settings.airportsDirectory, 
        this.icao[0], 
        this.icao[1], 
        this.icao[2], 
        this.icao + `.${type}.new.xml`);

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
        formData.append('groundnet', blob, this.icao + `.${type}.xml`);
        
        var parent = this.$parent;
        var messageField = this.message;
        // action after uploading happens
        xhr.onreadystatechange = function () {
  	    	if (xhr.status !== 200){
            parent.$refs.upload.message = 'Upload Error'
            parent.$refs.upload.error = true;
            console.error(xhr);                      
	       	}
	      }
        xhr.onload = function(e) {
          console.log("File uploading completed! ");
          console.log(e);
          parent.$refs.upload.uploading = false
          if (e.srcElement.status===500) {
            parent.$refs.upload.message == e.srcElement.statusText
          } else if(JSON.parse(e.srcElement.response).message.match('[A-Z0-9]* Imported Successfully')) {
            parent.$refs.upload.success = true
            parent.$refs.upload.message = `${type} Uploaded Successfully`
            parent.$store.commit('UPLOAD_WIP', parent.$store.state.Airports.currentAirport.icao)
            
          } else if(JSON.parse(e.srcElement.response).message === 'XML Errors') {
            var response = JSON.parse(e.srcElement.response);
            if (response.validationErrors) {
              parent.$refs.upload.message = 'XML Errors : \n';
              response.validationErrors.forEach(element => {
                parent.$refs.upload.message += element.message + '\n';
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
          if(!(this.$store.state.Loading.groundnetLoaded && 
              this.$store.state.Loading.pavementLoaded)) {
                return
              }
          this.scanning = true
          const winURL = process.env.NODE_ENV === 'development'
            ? `http://localhost:9080/src/renderer/utils/check.js`
            : `file://${process.resourcesPath}/workers/check.js`
          console.debug('make a check worker: ', path.resolve(__dirname, 'check.js'))

          const worker = new Worker(winURL)
          console.debug(fileUrl('src/renderer/utils/check.js'))

          worker.checking = this.checking
          worker.max = this.max
          worker.view = this
          worker.editLayer = this.$parent.$parent.$refs.editLayer
          worker.progress = 0
          // var worker = new Worker(fileUrl('src/renderer/utils/worker.js'))
          this.worker = worker
          var groundnet = []

          if (!this.editLayer().groundnetLayerGroup) {
            this.message = 'Groundnet not visible'
          }
          if (!this.pavementLayer().pavement) {
            this.message = 'Pavement not visible'
          }
          this.editLayer().groundnetLayerGroup.eachLayer(l => {
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
          this.pavementLayer().pavement.eachLayer(l => {
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
      },
      editLayer () {
        var parent = this.$parent;
        while (!parent.icao||parent.$refs.editLayer==undefined) {
          parent = parent.$parent;
          if (parent.icao&&parent.$refs.editLayer!==undefined) {
            return parent.$refs.editLayer;
          }
        }
      },      
      pavementLayer () {
        var parent = this.$parent;
        while (!parent.icao||parent.$refs.pavementLayer==undefined) {
          parent = parent.$parent;
          if (parent.icao&&parent.$refs.pavementLayer!==undefined) {
            return parent.$refs.pavementLayer;
          }
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
      textClass: function () {
        return !this.error?'centermessage':'error'
      },
      title: function () {        
        return `Upload ${this.icao} to groundweb.`
      },
      icao: {
        get: function () {
          var parent = this.$parent;
          while (!parent.icao) {
            parent = parent.$parent;
            if (parent.icao) {
              return parent.icao;
            }
          }
          return this.$store.state.Airports.currentAirport.icao
        },
        set: function (newValue) {
          console.error('ICAO being set ' + newValue);
        }
      },
      tower_comittable: function () {
        var f = path.join(this.$store.state.Settings.settings.airportsDirectory, 
        this.icao[0], 
        this.icao[1], 
        this.icao[2], 
        this.icao + '.twr.new.xml');
        return fs.existsSync(f) && this.gplv2 && this.max === 0 && this.azure && !this.uploading;
      },
      groundnet_comittable: function () {
        var f = path.join(this.$store.state.Settings.settings.airportsDirectory, 
        this.icao[0], 
        this.icao[1], 
        this.icao[2], 
        this.icao + '.groundnet.new.xml');
        return fs.existsSync(f) && this.$store.state.Check.results.filter(a => a.id>=0).length === 0 && this.gplv2 && this.max === 0 && this.azure && !this.uploading
      },
      threshold_comittable: function () {
        var f = path.join(this.$store.state.Settings.settings.airportsDirectory, 
        this.icao[0], 
        this.icao[1], 
        this.icao[2], 
        this.icao + '.threshold.new.xml');
        return fs.existsSync(f) && this.gplv2 && this.max === 0 && this.azure && !this.uploading
      },
      comittable: function () {
        return this.$store.state.Check.results.filter(a => a.id>=0).length === 0 && this.gplv2 && this.max === 0 && this.azure && !this.uploading
      },
      results: function () {
        return this.$store.state.Check.results.filter(a => a.id>=0)
      }
    },
}
</script>

<style scoped lang="scss">
  .el-dialog__body {padding: 10px;}
  .center { text-align: center; vertical-align: middle; padding: 5px; font-size: 12pt; font-weight: normal}  
  .centermessage { text-align: left; vertical-align: middle; padding: 5px; font-size: 12pt; font-weight: normal; white-space: pre-line;}  
  .error { text-align: center; color: red; padding: 5px; font-size: 12pt; font-weight: normal;}
  .el-dialog--center .el-dialog__body { padding: 5px;}
</style>
