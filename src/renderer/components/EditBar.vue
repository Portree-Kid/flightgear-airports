<!--
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->
<template>
  <div id="EditBar">

    <el-dialog
      title="Checking"
      width="30%"
      center
      :visible.sync="checkDialogVisible"
    >
      <el-container direction="vertical">
        <el-progress
          :percentage="Number(((progress / max) * 100).toPrecision(3))"
          v-if="max > 0"
        ></el-progress>
      </el-container>
    </el-dialog>

    <el-dialog
      title="Revert"
      :visible.sync="centerDialogVisible"
      width="550px"
      center
    >
      <span>
        Please select the Version to revert to.
        <el-row v-for="item in saves" :key="item.file">
           <el-button @click="revert(item.file)">{{item.mtime}}</el-button>
        </el-row>
      </span>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cancel">Cancel</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Saving"
      :visible.sync="saveDialogVisible"
      width="30%"
      center
    >
      <span style="center">Saving..</span>
    </el-dialog>

    <ZoomButton
      icon="fas fa-th"
      v-on:click="zoomin"
      :show="true"
      tooltip="Zoomin"
    ></ZoomButton>
    <ZoomButton
      icon="fas fa-th-large"
      v-on:click="zoomout"
      :show="!editing"
      tooltip="Zoomout"
    ></ZoomButton>

    <EditButton
      icon="fa fa-window-close"
      v-on:click="close"
      :show="editing"
      tooltip="Close/Save Editing"
    ></EditButton>
    <EditButton
      icon="fas fa-undo"
      v-on:click="openReload"
      :show="editing"
      tooltip="Revert to Savepoint"
    ></EditButton>
    <EditButton
      icon="fas fa-save"
      v-on:click="save"
      :show="editing"
      tooltip="Save"
    ></EditButton>
    <EditButton
      icon="far fa-check-square"
      v-on:click="showCheck"
      :show="editing"
      tooltip="Check"
    ></EditButton>
    <EditButton
      icon="fas fa-draw-polygon"
      v-on:click="drawPolyline"
      :show="editing"
      tooltip="Draw Bi-Directional Taxiline"
    ></EditButton>
    <EditButton
      icon="fas fa-long-arrow-alt-right"
      v-on:click="drawForwardPolyline"
      :show="editing"
      tooltip="Draw Forward Taxiline"
    ></EditButton>
    <EditButton
      icon="fas fa-arrows-alt-h"
      v-on:click="drawPushbackPolyline"
      :show="editing"
      tooltip="Draw Pushback"
    ></EditButton>
    <EditButton
      icon="fas fa-parking"
      v-on:click="drawParking"
      :show="editing"
      tooltip="Draw Parking"
    ></EditButton>
    <EditButton
      icon="fas fa-trash-alt"
      v-on:click="deleteFeature"
      :show="editing"
      tooltip="Remove"
    ></EditButton>
  </div>
</template>

<script lang="js">
/* eslint-disable */
  const path = require('path')
  const fs = require('fs');
  const mapper = require('../check/mapper');

  import {listSaves} from '../loaders/groundnet_loader'

  import EditButton from './EditButton'
  import ZoomButton from './ZoomButton';
  import Vue from 'vue'

  import fileUrl from 'file-url'

  export default {
    components: { EditButton, ZoomButton },
    data () {
      return {isEditing: false, uploadVisible: false, centerDialogVisible: false, saveDialogVisible: false, checkDialogVisible: false, checking: false, progress: 0, max: 0, pavementLayerVisible: true, saves: [] }
    },
    created () {
    },
    methods: {
      cancel () {
        this.centerDialogVisible = false
      },
      zoomout() {
        this.$parent.$parent.$refs.editLayer.stopDrawing()
        this.$parent.$parent.zoomUpdated(9)
      },
      zoomin() {
        this.$parent.$parent.$refs.editLayer.stopDrawing()
        this.$parent.$parent.zoomUpdated(14)
      },
      hideAPT() {
        this.pavementLayerVisible = !this.pavementLayerVisible
        this.$parent.$parent.$refs.pavementLayer.setVisible(this.pavementLayerVisible)
      },
      edit () {
        this.isEditing = true
        this.$emit('edit', true)
      },
      setEditing (editing) {
        this.isEditing = editing
      },
      revert (file) {
        this.isEditing = false
        this.$emit('edit', false)
        this.centerDialogVisible = false
        this.$parent.$parent.$refs.map.mapObject.options.minZoom = 1;
        this.$parent.$parent.$refs.editLayer.disableEdit()
        this.$parent.$parent.$refs.towerLayer.disableEdit()
        this.$parent.$parent.$refs.thresholdLayer.disableEdit()
        this.$parent.$parent.$refs.editLayer.reload(file)
      },
      close () {
        this.$parent.$parent.$refs.editLayer.stopDrawing()
        this.isEditing = false
        this.$emit('edit', false)
        this.$parent.$parent.$refs.map.mapObject.options.minZoom = 1;
        Vue.set(this, 'saveDialogVisible', true)
        this.$emit('edit', false)
        Vue.nextTick( function () {
            setTimeout( this.closeDefered.bind(this), 100);
        }, this)
      },
      closeDefered () {
        this.$parent.$parent.$refs.editLayer.save()
        this.$parent.$parent.$refs.towerLayer.save()
        this.$parent.$parent.$refs.thresholdLayer.save()
        this.$parent.$parent.$refs.editLayer.disableEdit()
        this.$parent.$parent.$refs.towerLayer.disableEdit()
        this.$parent.$parent.$refs.thresholdLayer.disableEdit()
        this.rescanCurrentGroundnet()
        Vue.set(this, 'saveDialogVisible', false)
      },
      save () {
        Vue.set(this, 'saveDialogVisible', true)
        this.$parent.$parent.$refs.editLayer.stopDrawing()
        Vue.nextTick( function () {
            setTimeout( this.saveDefered.bind(this), 100);
          }, this)
      },
      saveDefered () {
        this.$parent.$parent.$refs.editLayer.save()
        this.$parent.$parent.$refs.towerLayer.save()
        this.$parent.$parent.$refs.thresholdLayer.save()
        this.rescanCurrentGroundnet()
        Vue.set(this, 'saveDialogVisible', false)
      },
      rescanCurrentGroundnet () {
        try {
          const winURL = process.env.NODE_ENV === 'development'
            ? `http://localhost:9080/src/renderer/utils/worker.js`
            : `file://${process.resourcesPath}/workers/worker.js`
          console.log('make a worker: ', path.resolve(__dirname, 'worker.js'))

          var icao = this.$parent.$parent.$refs.editLayer.icao
          const worker = new Worker(winURL)

          var aptDir = path.join(this.$store.state.Settings.settings.airportsDirectory, icao[0], icao[1], icao[2]);
          worker.postMessage(['scan', aptDir ])
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
            } else if (e.data.length > 0) {
              if (e.data[0] === 'max') {
              }
              if (e.data[0] === 'progress') {
              }
            }
          }
        } catch (err) {
          console.error(err)
        }
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
          if(!this.$parent.$parent.$refs.pavementLayer.pavement) {
            this.max = 0
            this.checkDialogVisible = false
            this.$message({
              type: 'Error',
              showClose: true,
              message: `Check can't run without pavementlayer since runways aren't known. Is the APT file set correctly?`
            })
            return
          }

          const worker = new Worker(winURL)
          worker.onerror = function(e) {
            worker.terminate()
            worker.view.max = 0
            worker.view.checkDialogVisible = false
            e.preventDefault(); // <-- "Hey browser, I handled it!"
          }

          console.log(fileUrl('src/renderer/utils/check.js'))

          worker.checking = this.checking
          worker.max = this.max
          worker.view = this
          worker.editLayer = this.$parent.$parent.$refs.editLayer
          worker.progress = 0
          // var worker = new Worker(fileUrl('src/renderer/utils/worker.js'))
          this.worker = worker
          var groundnet = []
          this.$parent.$parent.$refs.editLayer.groundnetLayerGroup.eachLayer(l => {
            console.log(l)
            groundnet.push(l)
          })
          var features = groundnet.map(mapper.checkMapper).filter(n => n)
          var pavement = []
          this.$parent.$parent.$refs.pavementLayer.pavement.eachLayer(l => {
            console.log(l)
            pavement.push(l)
          })
          var thresholds = []
          this.$parent.$parent.$refs.thresholdLayer.getLayer().eachLayer(l => {
            console.log(l)
            thresholds.push(l)
          })
          var pavementFeatures = pavement.map(mapper.checkMapper).filter(n => n)
          //TODO
          var thresholdFeatures = thresholds.map(mapper.checkMapper).filter(n => n)

          worker.postMessage(['check', features.concat(pavementFeatures).concat(thresholdFeatures) ] )
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
      },
      drawPolyline () {
        this.$parent.$parent.$refs.editLayer.stopDrawing()
        this.$parent.$parent.$refs.editLayer.drawPolyline()
      },
      drawForwardPolyline () {
        this.$parent.$parent.$refs.editLayer.stopDrawing()
        this.$parent.$parent.$refs.editLayer.drawForwardPolyline()
      },
      drawPushbackPolyline () {
        this.$parent.$parent.$refs.editLayer.stopDrawing()
        this.$parent.$parent.$refs.editLayer.drawPushbackPolyline()
      },
      drawParking () {
        this.$parent.$parent.$refs.editLayer.stopDrawing()
        this.$parent.$parent.$refs.editLayer.drawParking()
      },
      deleteFeature () {
        this.$parent.$parent.$refs.editLayer.stopDrawing()
        this.$parent.$parent.$refs.editLayer.deleteFeature()
      },
      showCheck() {
        this.$parent.$parent.$refs.editLayer.stopDrawing()
        Vue.set(this, 'checkDialogVisible', true)
        this.check()
      },
      openReload: function() {
        this.centerDialogVisible = true
        var icao = this.$parent.$parent.$refs.editLayer.icao
        if (icao !== undefined && icao !== '') {
          this.saves = listSaves(this.$store.state.Settings.settings.airportsDirectory, icao).sort((a, b) => a.mtimeMs - b.mtimeMs)
        }
      }
    },
    computed: {
      editing: {
      // getter
        get: function () {
          console.log(`Getting Visible : ${this.isEditing}`)
          return this.isEditing
        },
        // setter
        set: function (newValue) {
          this.isEditing = newValue
          console.log(`Setting Visible : ${this.isEditing}`)
        }
      }
    }
  }
</script>