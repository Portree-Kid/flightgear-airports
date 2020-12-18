<!--
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->
<template>
        <div class="leaflet-sidebar-pane" id="home">
            <h1 class="leaflet-sidebar-header">
                {{version}}
                <div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div>
            </h1>
            <h2>Setup</h2>            
            <ol>
              <li>Set directories in settings (bottom left)</li>
              <li>Start scans one after the other in sidebar with magnifying glass.</li>              
            </ol>
            <h2>Search</h2>
            You can search for airports with ICAO or parts of the name. Only airports with flights are shown. 
            If you want to view another one it will be added when you type the full ICAO.
            <h2>World view</h2>
            <p>
              When zoomed out you will see circles. Their size corresponds with the number of flights. 
              Blue means Ok. Yellow to little parking in comparison to the number of flights. Red no groundnet.
            </p>
            <h2>Edit view</h2>
            <p>
            </p>
            <ul>
              <li>Undo undos all changes or all changes during session</li>
              <li>Save, saves the groundnet</li>
              <li>Check triggers the groundnet check.</li>
              <li>Draw bi directional taxiline</li>
              <li>Draw uni directional taxiline</li>
              <li>Draw pushback.</li>
              <li>Add parking</li>
              <li>Remove element, removes the currently selected element</li>
            </ul>
        </div>
</template>

<script lang="js">
  export default {
    name: 'help',
    props: [],
    mounted () {

    },
    data () {
      return {

      }
    },
    methods: {

    },
    computed: {
      version: function () {
        return ' Flightgear Airports ' + require('electron').remote.app.getVersion()
      }
    }
}
</script>

<style scoped lang="scss">
</style>
