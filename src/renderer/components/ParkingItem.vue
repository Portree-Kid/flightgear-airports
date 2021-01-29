<!--
Copyright 2021 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->
<template>
<div>
  <el-link v-if="!editing" type="primary" @click="show(parking.index)">{{parking.name}} {{number}} {{parking.type}}</el-link>          
  <el-input @focus="show(parking.index)" v-if="editing" placeholder="Name" v-model="name" class="wide"></el-input>
  <el-input @focus="show(parking.index)" v-if="editing" placeholder="Number" v-model="number" class="narrow"></el-input>
  <el-select @focus="show(parking.index)" v-if="editing" v-model="parking_type" placeholder="Select">
          <el-option
            v-for="type in options"
            :key="type.value"
            :label="type.label"
            :value="type.value"
            :disabled="type.disabled"
          ></el-option>
        </el-select>
</div>
</template>

<script lang="js">
  export default {
    name: 'parking-item',
    props: {parking: Object},
    mounted () {
    },
    data () {
      return { editLayer: null
      }
    },
    methods: {
      show (idx) {
        if (this.editLayer === null) {
          this.initLayer()
        }
        if (this.editLayer) {
          return this.editLayer.show(idx)
        }
      },
      initLayer () {
        var parent = this.$parent
        while (parent && !parent.$refs.editLayer) {
          parent = parent.$parent
        }
        if (parent) {
          this.editLayer = parent.$refs.editLayer
        }
      }
    },
    computed: {
      options: function () {
        return [{value: 'none', label: 'none', disabled: true},
          {value: 'ga', label: 'general aviation'},
          {value: 'cargo', label: 'cargo'},
          {value: 'gate', label: 'commercial passenger traffic'},
          {value: 'mil-fighter', label: 'military fighter'},
          {value: 'mil-cargo', label: 'military cargo'}
        ]
      },
      editing: function () {
        if (this.editLayer === null) {
          this.initLayer()
        }
        return this.editLayer.editing
      },
      name: {
      // getter
        get: function () {
          return this.parking.name
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_ITEM_NAME', [this.parking.index, newValue])
        }
      },
      number: {
      // getter
        get: function () {
          return this.parking.number
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_ITEM_NUMBER', [this.parking.index, newValue])
        }
      },
      parking_type: {
      // getter
        get: function () {
          if (this.parking.type === undefined) {
            return 'none'
          }
          return this.parking.type
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_ITEM_TYPE', [this.parking.index, newValue])
        }
      }

    }
}
</script>

<style scoped lang="scss">
div {
  display: flex;
  justify-content: space-between;
}
div.wide {
  width: 40%;
}
div.narrow {
  width: 20%;
}

</style>
