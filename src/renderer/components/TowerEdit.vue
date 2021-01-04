<template>
  <div width="100%" v-if="tower">
    <div>
      <el-row>
        <el-col :span="7">
          <span class="label">Latitude :</span>
        </el-col>
        <el-col :span="17">
          <el-input placeholder="Please input" v-model="latitude" :disabled="!editing"  
          @focus="coordFocussed = true" 
          @blur="coordFocussed = false"></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="7">
          <span class="label">Longitude :</span>
        </el-col>
        <el-col :span="17">
          <el-input placeholder="Please input" v-model="longitude" :disabled="!editing"  
          @focus="coordFocussed = true" 
          @blur="coordFocussed = false"></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="7">
          <span class="label">Height :</span>
        </el-col>
        <el-col :span="17">
          <el-input placeholder="Please input" v-model="height" :disabled="!editing"  
          @focus="coordFocussed = true" 
          @blur="coordFocussed = false"></el-input>
        </el-col>
      </el-row>
    </div>
  </div>
</template>


<script lang="js">
/* eslint-disable */
  const Coordinates = require('coordinate-parser');
  import {writeTowerXML} from '../loaders/tower_writer'


  export default {
    /*
    methods: {
      updateIsOnRunway (value) {
        this.$store.commit('SET_EDIT_ISONRUNWAY', value)
      }
    },
    */
    data () {
      return {
        coordFocussed: false
      }
    },
    methods: {
      save () {
        var o = {latitude: this.latitude, longitude: this.longitude, height: this.height};
        writeTowerXML(this.$store.state.Settings.settings.airportsDirectory, this.$parent.$parent.$parent.icao, o)
      }
    },
    computed: {
      editing: {
        get: function () {
          return false //this.$parent.$parent.$parent.$refs.editLayer.editing 
        }
      },
      tower: function () {
        return this.$store.state.Editable.type === 'tower'
      },
      // {index: 39, lat: "N58 27.343", lon: "W03 5.153", isOnRunway: 0, holdPointType: "none"}
      latitude: function () {
        return this.$store.state.Editable.data.tower.coords.latitude;
      },
      longitude: function () {
        return this.$store.state.Editable.data.tower.coords.longitude;
      },
      height: function () {
        return this.$store.state.Editable.data.tower.coords.height;
      }
    }
  }
</script>
