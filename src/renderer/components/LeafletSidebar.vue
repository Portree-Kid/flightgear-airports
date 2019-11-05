<template>
<div id="sidebar" class="leaflet-sidebar collapsed">
    <!-- Nav tabs -->
    <div class="leaflet-sidebar-tabs">
        <ul role="tablist"> <!-- top aligned tabs -->
            <li><a href="#home" role="tab"><i class="fa fa-bars"></i></a></li>
            <li><a href="#messages" role="tab"><i class="fa fa-envelope"></i></a></li>
            <li><a href="#profile" role="tab"><i class="fa fa-user"></i></a></li>
        </ul>

        <ul role="tablist"> <!-- bottom aligned tabs -->
            <li><a href="#settings" role="tab"><i class="fa fa-gear"></i></a></li>
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

        <div class="leaflet-sidebar-pane" id="messages">
            <h1 class="leaflet-sidebar-header">Messages<div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div></h1>
            <el-select v-model="value" placeholder="Select"><el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">  </el-option>    </el-select>
        </div>

        <div class="leaflet-sidebar-pane" id="profile">
            <h1 class="leaflet-sidebar-header">Profile<div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div></h1>
        </div>
    </div>
</div>  
</template>

<script lang="js">
  import 'leaflet-sidebar-v2/css/leaflet-sidebar.css'
  import 'font-awesome/css/font-awesome.css'
  import {} from 'leaflet-sidebar-v2'
  import L from 'leaflet'
  import SettingsPanel from './SettingsPanel'

  export default {
    name: 'leaflet-sidebar',
    components: { SettingsPanel },
    props: [],
    mounted () {
      this.add()
    },
    beforeDestroy () {
      this.remove()
    },
    data () {
      return {
        message: 'BLBL',
        checkbox: true,
        options: [{
          value: 'Option1',
          label: 'Option1'
        }, {
          value: 'Option2',
          label: 'Option2'
        }, {
          value: 'Option3',
          label: 'Option3'
        }, {
          value: 'Option4',
          label: 'Option4'
        }, {
          value: 'Option5',
          label: 'Option5'
        }],
        value: ''
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

        this.sidebar.addPanel({
          id: 'properties',
          tab: '<i class="fa fa-road vertical-center"/>',
          title: 'Properties',
          pane: '<div id="properties-tab"></div>'
        })

        this.sidebar.addPanel({
          id: 'settings',
          tab: '<i class="fa fa-gear vertical-center"/>',
          title: 'Settings',
          pane: '<div id="settings-div"></div>'
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
      }
    },
    computed: {

    }
}
</script>

<style scoped lang="scss">
</style>
