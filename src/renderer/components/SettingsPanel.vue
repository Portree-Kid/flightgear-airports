<template>
  <div>
    <h1 class="leaflet-sidebar-header">
      Settings
      <div class="leaflet-sidebar-close">
        <i class="fa fa-caret-left"></i>
      </div>
    </h1>
    <div id="panel" width="100%">
      <el-row>
        <el-col :span="7">Flightgear Directory</el-col>
        <el-col :span="15">{{ flightgear_directory }}</el-col>
        <el-col :span="2">
          <directory-select @input="directorySelect"></directory-select>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="js">
  import FileSelect from './FileSelect'
  import DirectorySelect from './DirectorySelect'
  export default {
    name: 'settings-panel',
    components: { DirectorySelect, FileSelect },
    props: [],
    mounted () {
    },

    data () {
      return {
      }
    },
    methods: {
      directorySelect: function (flightgearDirectory) {
        console.log(flightgearDirectory)
        this.$store.commit('SETTINGS_DIRECTORY', flightgearDirectory.path)
      }
    },
    computed: {
      flightgear_directory: function () {
        return this.$store.state.Settings.settings.flightgearDirectory
      }
    }
  }
</script>

<style>
.el-row {
  margin-bottom: 20px;
}
.el-col {
  border-radius: 4px;
}
</style>
