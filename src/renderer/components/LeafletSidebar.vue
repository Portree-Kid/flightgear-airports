<template>
<div id="sidebar" class="leaflet-sidebar collapsed">
    <!-- Nav tabs -->
    <div class="leaflet-sidebar-tabs">
        <ul role="tablist"> <!-- top aligned tabs -->
            <li><a href="#home" role="tab"><i class="fa fa-bars"></i></a></li>
            <li><a href="#edit" role="tab"><i class="fas fa-edit"></i></a></li>
            <li><a href="#parking" role="tab"><i class="fas fa-parking"></i></a></li>
            <li><a href="#search" role="tab"><i class="fa fa-search"></i></a></li>
            <li><a href="#check" role="tab"><i class="far fa-check-square"></i></a></li>
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
          <AirportEdit></AirportEdit>
          <ParkingEdit></ParkingEdit>
          <ArcEdit></ArcEdit>
          <NodeEdit></NodeEdit>          
        </div>
        <div class="leaflet-sidebar-pane" id="parking">
          <ParkingList></ParkingList>
        </div>
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
  import ParkingList from './ParkingList'
  import RunScan from './RunScan'
  import SettingsPanel from './SettingsPanel'
  import Search from './Search'
  import WorkInProgress from './WorkInProgress'

  export default {
    name: 'leaflet-sidebar',
    components: { Help, AirportEdit, ArcEdit, CheckPanel, NodeEdit, ParkingEdit, ParkingList, RunScan, FileSelect, SettingsPanel, Search, WorkInProgress },
    props: [],
    mounted () {
      this.add()
    },
    beforeDestroy () {
      this.remove()
    },
    data () {
      return {
      }
    },
    methods: {
      deferredMountedTo (parent) {
        this.sidebar = L.control.sidebar({
          autopan: false, // whether to maintain the centered map point when opening the sidebar
          closeButton: true, // whether t add a close button to the panes
          container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
          position: 'left' // left or right
        })
        parent.addControl(this.sidebar)
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
      scan () {
      }
    },
    computed: {

    }
}
</script>

<style scoped lang="scss">
</style>
