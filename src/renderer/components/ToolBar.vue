<template>
  <div id="ToolBar">
    <ToolButton
      icon="fas fa-draw-polygon"
      v-on:click="drawPolyline"
      :show="editing"
      tooltip="Draw Guidline"
    ></ToolButton>
  </div>
</template>

<script lang="js">
/* eslint-disable */
  import ToolButton from './ToolButton'
  import Vue from 'vue'

  import fileUrl from 'file-url'
  const path = require('path')
  const fs = require('fs');

  export default {
    components: { ToolButton },
    data () {
      return {isEditing: false}
    },
    created () {
    },
    methods: {
      drawPolyline () {
        this.$parent.$parent.$refs.toolLayer.stopDrawing()
        this.$parent.$parent.$refs.toolLayer.drawPolyline()
      },
      setEdit (edit) {
        this.isEditing = edit;
        if(!this.isEditing) {
          this.$parent.$parent.$refs.toolLayer.stopDrawing()
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