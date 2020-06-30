<!--
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->
<template>
  <div id="ToolBar">
    <ToolButton
      icon="fas fa-draw-polygon"
      v-on:click="drawPolyline"
      :show="editing"
      tooltip="Draw Guideline"
    ></ToolButton>
  </div>
</template>

<script lang="js">
/* eslint-disable */
  import ToolButton from './ToolButton'
  import Vue from 'vue'  

  import fileUrl from 'file-url'
  const path = require('path')
  const fs = require('fs')


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