<template>
  <div width="100%" v-if="node">
    <div>
      <el-row>
        <el-col :span="7">
          <span class="label">Coordinates :</span>
        </el-col>
        <el-col :span="17">
          <el-input placeholder="Please input" v-model="coordinates" :disabled="!editing"  
          @focus="coordFocussed = true" 
          @blur="coordFocussed = false"></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="7">
          <span class="label">Is on runway :</span>
        </el-col>
        <el-col :span="15">
          <el-switch v-model="isOnRunway" :disabled="!editing" @focus="runwayFocussed = true" 
          @blur="runwayFocussed = false"></el-switch>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="9">
          <span class="label">Holdpoint Type :</span>
        </el-col>
        <el-col :span="15">
          <el-select v-model="holdPointType" placeholder="Select" :disabled="!editing" >
            <el-option
              v-for="type in options"
              :key="type.value"
              :label="type.label"
              :value="type.value"
              :disabled="type.disabled"
            ></el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row>
        <el-popover
          placement="top-start"
          title="Goto"
          width="200"
          trigger="hover"
          content="Weld/Link nodes"
        >
          <el-button @click="link" slot="reference"><i class="fas fa-link"></i></el-button>
        </el-popover>
        </el-row>
    </div>
  </div>
</template>


<script lang="js">
/* eslint-disable */
  const Coordinates = require('coordinate-parser');
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
        coordFocussed: false, runwayFocussed: false, holdFocussed: false
      }
    },
    methods: {
      link: function () {
        this.$parent.$parent.$parent.$refs.editLayer.link(this.$store.state.Editable.index)
      }
    },
    computed: {
      editing: {
        get: function () {
          return this.$parent.$parent.$parent.$refs.editLayer.editing
        }
      },
      options: function () {
        return [{value: 'none', label: 'none', disabled: false }, {value: 'PushBack', label: 'PushBack'}, {value: 'normal', label: 'normal'}, {value: 'CAT II/III', label: 'CAT II/III'}]
      },
      node: function () {
        return this.$store.state.Editable.type === 'node' || this.$store.state.Editable.type === 'runway'
      },
      // {index: 39, lat: "N58 27.343", lon: "W03 5.153", isOnRunway: 0, holdPointType: "none"}
      coordinates: {
      // getter
        get: function () {
          if(this.$store.state.Editable.index!==undefined) {
            return this.$store.state.Editable.data.node.coords;
          }
        },
        // setter
        set: function (newValue) {
          if (this.coordFocussed) {
            this.$store.commit('SET_EDIT_NODE_COORDS', newValue)            
          }          
        }
      },
      isOnRunway: {
      // getter
        get: function () {
          return this.$store.state.Editable.data.node.isOnRunway === 1
        },
        // setter
        set: function (newValue) {
          if(!this.runwayFocussed) {
             this.$store.commit('SET_EDIT_ISONRUNWAY', newValue ? 1 : 0)
          }
        }
      },
      holdPointType: {
      // getter
        get: function () {
          if (this.$store.state.Editable.data.node.holdPointType === undefined) {
            return 'none'
          }
          return this.$store.state.Editable.data.node.holdPointType
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_HOLDPOINTTYPE', newValue)
        }
      }
    }
  }
</script>
