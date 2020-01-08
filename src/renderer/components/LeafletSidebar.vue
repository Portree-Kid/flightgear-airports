<template>
<div id="sidebar" class="leaflet-sidebar collapsed">
    <!-- Nav tabs -->
    <div class="leaflet-sidebar-tabs">
        <ul role="tablist"> <!-- top aligned tabs -->
            <li><a href="#home" role="tab"><i class="fa fa-bars"></i></a></li>
            <li><a href="#airports" role="tab"><i class="fas fa-edit"></i></a></li>
            <li><a href="#scan" role="tab"><i class="fa fa-search"></i></a></li>
        </ul>

        <ul role="tablist"> <!-- bottom aligned tabs -->
            <li><a href="#settings" role="tab"><i class="fas fa-cog"></i></a></li>
        </ul>
    </div>

    <!-- Tab panes -->
    <div class="leaflet-sidebar-content">
        <div class="leaflet-sidebar-pane" id="home">
            <h1 class="leaflet-sidebar-header">
                sidebar-v2
                <div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div>
            </h1>
            <p>A responsive sidebar for mapping libraries</p>
        </div>
        <div class="leaflet-sidebar-pane" id="airports">
          <AirportEdit></AirportEdit>
          <GroundnetEdit></GroundnetEdit>
          <ArcEdit></ArcEdit>
        </div>
        <div class="leaflet-sidebar-pane" id="scan">
          <RunScan></RunScan>
        </div>
        <div class="leaflet-sidebar-pane" id="settings">
          <SettingsPanel></SettingsPanel>
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
  import GroundnetEdit from './GroundnetEdit'
  import ArcEdit from './ArcEdit'
  import SettingsPanel from './SettingsPanel'
  import RunScan from './RunScan'
  import FileSelect from './FileSelect'

  export default {
    name: 'leaflet-sidebar',
    components: { AirportEdit, ArcEdit, GroundnetEdit, SettingsPanel, RunScan, FileSelect },
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
