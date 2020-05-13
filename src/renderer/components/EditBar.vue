<template>
  <div id="EditBar">
    <Upload :visible.sync="uploadVisible" ref="upload"></Upload>
    <EditButton icon="fas fa-th" v-on:click="zoomin" :show="true" tooltip="Zoomin"></EditButton>
    <EditButton icon="fas fa-th-large" v-on:click="zoomout" :show="!editing" tooltip="Zoomout"></EditButton>
    <EditButton icon="fas fa-upload" v-on:click="upload" :show="!editing" tooltip="Upload"></EditButton>
    <EditButton icon="fas fa-plane" v-on:click="test" :show="!editing" tooltip="Test"></EditButton>
    <EditButton icon="fas fa-edit" v-on:click="edit" :show="!editing" tooltip="Edit"></EditButton>
    <EditButton
      icon="fas fa-undo"
      v-on:click="centerDialogVisible = true"
      :show="editing"
      tooltip="Undo"
    ></EditButton>
    <el-dialog title="Reload" :visible.sync="centerDialogVisible" width="30%" center>
      <span style="center">Reload from last save? You will lose the current edits.</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="undoFirst">Base version (GIT)</el-button>
        <el-button type="primary" @click="undoLast">Last save</el-button>
      </span>
    </el-dialog>
    <el-dialog title="Saving" :visible.sync="saveDialogVisible" width="30%" center>
      <span style="center">Saving..</span>
    </el-dialog>

    <EditButton icon="fas fa-save" v-on:click="save" :show="editing" tooltip="Save"></EditButton>
    <EditButton
      icon="fas fa-draw-polygon"
      v-on:click="drawPolyline"
      :show="editing"
      tooltip="Draw Taxiline"
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
    <EditButton icon="fas fa-trash-alt" v-on:click="deleteFeature" :show="editing" tooltip="Remove"></EditButton>
    <EditButton icon="far fa-check-square" v-on:click="showCheck" :show="editing" tooltip="Check"></EditButton>
    <el-dialog title="Checking" width="30%" center :visible.sync="checkDialogVisible">
      <el-container direction="vertical">
        <el-progress :percentage="Number(((progress / max)*100).toPrecision(3))" v-if="max>0"></el-progress>
      </el-container>
    </el-dialog>
  </div>
</template>

<script lang="js">
/* eslint-disable */
  import EditButton from './EditButton'
  import Upload from './Upload'
  import Vue from 'vue'

  import fileUrl from 'file-url'
  const path = require('path')
  const fs = require('fs');

  export default {
    components: { EditButton, Upload },
    data () {
      return {isEditing: false, uploadVisible: false, centerDialogVisible: false, saveDialogVisible: false, checkDialogVisible: false, checking: false, progress: 0, max: 0}
    },
    created () {
    },
    methods: {
      upload() {
        this.uploadVisible = true
        this.$refs.upload.check()
      },
      zoomout() {
        this.$parent.$parent.zoomUpdated(9)
      },
      zoomin() {
        this.$parent.$parent.zoomUpdated(14)
      },
      edit () {
        this.editing = true
        this.$parent.$parent.$refs.map.mapObject.options.minZoom = 13;
        this.$parent.$parent.$refs.editLayer.enableEdit()
      },
      undoFirst () {
        this.editing = false
        this.centerDialogVisible = false
        this.$parent.$parent.$refs.map.mapObject.options.minZoom = 1;
        this.$parent.$parent.$refs.editLayer.disableEdit()
        this.$parent.$parent.$refs.editLayer.reload(true)
      },
      undoLast () {
        this.editing = false
        this.centerDialogVisible = false
        this.$parent.$parent.$refs.map.mapObject.options.minZoom = 1;
        this.$parent.$parent.$refs.editLayer.disableEdit()
        this.$parent.$parent.$refs.editLayer.reload(false)
      },
      save () {
        this.editing = false
        this.$parent.$parent.$refs.map.mapObject.options.minZoom = 1;
        Vue.set(this, 'saveDialogVisible', true)
        this.editing = false
        Vue.nextTick( function () {
            setTimeout( this.saveDefered.bind(this), 100);
          }, this)
      },
      saveDefered () {
        this.$parent.$parent.$refs.editLayer.save()
        this.$parent.$parent.$refs.editLayer.disableEdit()
        Vue.set(this, 'saveDialogVisible', false)              
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
        }, 1000)
      },
      test() {
        this.$parent.$parent.$refs.editLayer.test()
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
          var xml = []
          this.$parent.$parent.$refs.editLayer.groundnetLayerGroup.eachLayer(l => {
            console.log(l)
            xml.push(l)
          })

          var features = xml.map(this.featuresMapper).filter(n => n)

          worker.postMessage(['check', features ] )
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
        this.$parent.$parent.$refs.editLayer.drawPolyline()
      },
      drawPushbackPolyline () {
        this.$parent.$parent.$refs.editLayer.drawPushbackPolyline()
      },
      drawParking () {
        this.$parent.$parent.$refs.editLayer.drawParking()
      },
      deleteFeature () {
        this.$parent.$parent.$refs.editLayer.deleteFeature()
      },
      showCheck() {
        Vue.set(this, 'checkDialogVisible', true)
        this.check()
      },
      featuresMapper(o) {
        if (o instanceof L.ParkingSpot) {
          return { 'index': Number(o['id']), 
          '_leaflet_id': o._leaflet_id, 
          'type': 'parking', 
          'name': o.options.attributes.name, 
          'radius': String(o.options.attributes.radius),
          'lat': o._latlng.lat,
          'lng': o._latlng.lng };
        } else if (o instanceof L.RunwayNode) {
          console.log(o)
          return { 'index': Number(o['glueindex']), '_leaflet_id': o._leaflet_id, 'type': 'runway' };
        } else if (o instanceof L.HoldNode) {
          console.log(o)
          return { 'index': Number(o['glueindex']), '_leaflet_id': o._leaflet_id, 'type': o.holdPointType };
        } else if (o instanceof L.Polyline) {
          console.log(o)
          return { 'start': Number(o['begin']), 'end': Number(o['end']), '_leaflet_id': o._leaflet_id, 'type': 'poly', 'isPushBackRoute': o.options.attributes.isPushBackRoute };
        } else {
          console.log('Unknown Type ')
          console.log(typeof o)
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