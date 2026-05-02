<!--
Copyright 2026 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->
<template>
    <div>
        <el-button @click="show" class="button">
            {{procedure.type}}/{{procedure.name}}
        </el-button>
    </div>
</template>

<script lang="js">
  import {readProcedureXML} from '../loaders/procedures_loader'
  var layerGroup = null

  export default {
    name: 'procedure-item',
    props: {procedure: Object},
    mounted () {
    },
    data () {
      return { designator: this
      }
    },
    methods: {
      show () {
        if (layerGroup) {
          this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.mapObject.removeLayer(layerGroup)
        }
        layerGroup = readProcedureXML(this.$store.state.Settings.settings.airportsDirectory, this.$store.state.Airports.currentAirport.icao, this.procedure.type, this.procedure.name)
        layerGroup.addTo(this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.mapObject)
      }
    },
    computed: {
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
