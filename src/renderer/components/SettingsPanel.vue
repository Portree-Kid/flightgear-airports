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
        <el-col :span="7">Airports Directory</el-col>
        <el-col :span="15">{{ airports_directory }}</el-col>
        <el-col :span="2">
          <directory-select @input="airportsDirectorySelect"></directory-select>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="7">Flightgear Directory</el-col>
        <el-col :span="15">{{ flightgear_directory }}</el-col>
        <el-col :span="2">
          <directory-select @input="flightgearDirectorySelect"></directory-select>
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
      flightgearDirectorySelect: function (flightgearDirectory) {
        console.log(flightgearDirectory)
        this.$store.commit('FLIGHTGEAR_DIRECTORY', flightgearDirectory.path)
      },
      airportsDirectorySelect: function (flightgearDirectory) {
        console.log(flightgearDirectory)
        this.$store.commit('AIPORTS_DIRECTORY', flightgearDirectory.path)
      }
    },
    computed: {
      flightgear_directory: function () {
        return this.$store.state.Settings.settings.flightgearDirectory
      },
      airports_directory: function () {
        return this.$store.state.Settings.settings.airportsDirectory
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
