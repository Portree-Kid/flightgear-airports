<!--
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
-->
<template>
<div id="sidebar" class="leaflet-sidebar collapsed">
    <Upload :visible.sync="uploadVisible" ref="upload"></Upload>
    <!-- Nav tabs -->
    <div class="leaflet-sidebar-tabs">
        <ul role="tablist"> <!-- top aligned tabs -->
            <li><a href="#home" role="tab"><i class="fa fa-bars"></i></a></li>
            <li><a href="#edit" role="tab"><i class="fas fa-edit"></i></a></li>
            <!--<li><a href="#parking" role="tab"><i class="fas fa-parking"></i></a></li>-->
            <li :v-if="results"><a href="#check" role="tab"><i class="far fa-check-square"></i></a></li>
            <li><a href="#search" role="tab"><i class="fa fa-search"></i></a></li>
            <li><a href="#wip" role="tab"><i class="fas fa-wrench"></i></a></li>
        </ul>

        <ul role="tablist"> <!-- bottom aligned tabs -->
            <li><a href="#scan" role="tab"><i class="fa fa-sync"></i></a></li>
            <li><a href="#settings" role="tab"><i class="fas fa-cog"></i></a></li>
        </ul>
    </div>

    <!-- Tab panes -->
    <div class="leaflet-sidebar-content">
        <Help/>
        <div class="leaflet-sidebar-pane" id="edit">
            <h1 class="leaflet-sidebar-header">
                Properties
                <div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div>
            </h1>
          <ParkingEdit></ParkingEdit>
          <ArcEdit></ArcEdit>
          <NodeEdit></NodeEdit>          
          <ParkingGroupEdit ref="parkingGroupEdit"  @editParking="(msg) => $emit('editParking', msg)"></ParkingGroupEdit>
          <AirportEdit  ref="airportEdit" @edit="$emit('edit', $event)"></AirportEdit>
        </div>
        <!--
        <div class="leaflet-sidebar-pane" id="parking">
          <ParkingList></ParkingList>
        </div>
        -->
        <div class="leaflet-sidebar-pane" id="search">
          <Search></Search>
        </div>
        <div class="leaflet-sidebar-pane" id="scan">
          <RunScan></RunScan>
        </div>
        <div class="leaflet-sidebar-pane" id="settings">
          <SettingsPanel></SettingsPanel>
        </div>
        <div class="leaflet-sidebar-pane" id="check">
          <CheckPanel></CheckPanel>
        </div>
        <div class="leaflet-sidebar-pane" id="wip">
          <WorkInProgress></WorkInProgress>
        </div>
    </div>
</div>  
</template>

<script lang="js">
  import 'leaflet-sidebar-v2/css/leaflet-sidebar.css'
  import '@fortawesome/fontawesome-free/css/all.css'
  import {} from 'leaflet-sidebar-v2'
  import L from 'leaflet'
  import AirportEdit from './AirportEdit'
  import ArcEdit from './ArcEdit'
  import CheckPanel from './CheckPanel'
  import FileSelect from './FileSelect'
  import Help from './Help'
  import NodeEdit from './NodeEdit'
  import ParkingEdit from './ParkingEdit'
  import ParkingGroupEdit from './ParkingGroupEdit'
  // import ParkingList from './ParkingList'
  import RunScan from './RunScan'
  import SettingsPanel from './SettingsPanel'
  import Search from './Search'
  import Upload from './Upload'
  import WorkInProgress from './WorkInProgress'

  export default {
    name: 'leaflet-sidebar',
    components: { Help, AirportEdit, ArcEdit, CheckPanel, NodeEdit, ParkingEdit, ParkingGroupEdit, RunScan, FileSelect, SettingsPanel, Search, Upload, WorkInProgress },
    props: [],
    created () {
      window.addEventListener('keydown', this.doCommand)
    },
    destroyed () {
      window.removeEventListener('keydown', this.doCommand)
    },
    mounted () {
      this.add()
    },
    beforeDestroy () {
      this.remove()
    },
    data () {
      return { uploadVisible: false
      }
    },
    methods: {
      doCommand (e) {
        let cmd = String.fromCharCode(e.keyCode).toLowerCase()
        if (e.keyCode === 46 /** DEL */) {
          this.$parent.$parent.$refs.editLayer.deleteFeature()
        }
        console.log(cmd)
      },
      deferredMountedTo (parent) {
        this.sidebar = L.control.sidebar({
          autopan: false, // whether to maintain the centered map point when opening the sidebar
          closeButton: true, // whether to add a close button to the panes
          container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
          position: 'left' // left or right
        })
        parent.addControl(this.sidebar)
        this.$store.subscribe((mutation, state) => {
          switch (mutation.type) {
            case 'SET_EDIT_AIRPORT':
            case 'SET_EDIT_PARKING':
            case 'SET_EDIT_NODE':
            case 'SET_EDIT_RUNWAY':
            case 'SET_EDIT_ARC':
              this.sidebar.open('edit')
              break
            case 'CHECK_RESULTS':
              this.sidebar.open('check')
              break
            default:
              break
          }
        })
      },
      remove () {
        if (this.sidebar) {
          this.$parent.removeLayer(this.sidebar)
        }
      },
      add () {
        if (this.$parent._isMounted) {
          this.deferredMountedTo(this.$parent.mapObject)
        }
      },
      setEditing (editing) {
        this.$refs.parkingGroupEdit.setEditing(editing)
        this.$refs.airportEdit.setEditing(editing)
      },
      setData (data) {
        if (data.length > 0) {
          this.sidebar.open('edit')
          this.$refs.parkingGroupEdit.setData(data)
        }
      },
      scan () {
      }
    },
    computed: {
      results: function () {
        return this.$store.state.Check.results.length > 0
      }
    }
}
</script>

<style scoped lang="scss">
</style>
<style>
/* global styles */
.el-popover--plain {
  padding: 10px 10px;
}
.el-popover__title {
  display: none;
}
</style>