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
        <el-col :span="22" class="label">Airports Directory</el-col>
      </el-row>
      <el-row>
        <el-col :span="20" class="file-label">{{ airports_directory }}</el-col>
        <el-col :span="4">
          <directory-select @input="airportsDirectorySelect"></directory-select>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="22" class="label">Flightgear Directory</el-col>
      </el-row>
      <el-row>
        <el-col :span="20" class="file-label">{{ flightgear_directory }}</el-col>
        <el-col :span="4">
          <directory-select @input="flightgearDirectorySelect"></directory-select>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="7" class="label">Traffic Directory</el-col>
        <el-col :span="15" class="file-label">{{ Traffic_directory }}</el-col>
        <el-col :span="2">
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="7" class="label">APT File</el-col>
        <el-col :span="15" class="file-label">{{ apt_file }}</el-col>
        <el-col :span="2">
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="7" class="label">Test Directory</el-col>
        <el-col :span="15" class="file-label">{{ test_directory }}</el-col>
        <el-col :span="2">
          <directory-select @input="testDirectorySelect"></directory-select>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="22" class="label">Phi Host Url</el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="label">
            <el-input placeholder="Please input a valid Phi URL" v-model="phi_url"></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="7" class="label">Author : </el-col>
        <el-col :span="17">
            <el-input placeholder="Please input your email" v-model="email"></el-input>
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
      },
      testDirectorySelect: function (testDirectory) {
        console.log(testDirectory)
        this.$store.commit('TEST_DIRECTORY', testDirectory.path)
      }
    },
    computed: {
      email: {
      // getter
        get: function () {
          return this.$store.state.Settings.settings.email
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EMAIL', newValue)
        }
      },
      phi_url: {
      // getter
        get: function () {
          return this.$store.state.Settings.settings.phi_url
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_PHI_URL', newValue)
        }
      },
      flightgear_directory: function () {
        return this.$store.state.Settings.settings.flightgearDirectory
      },
      AI_directory: function () {
        return this.$store.state.Settings.settings.flightgearDirectory_ai
      },
      Traffic_directory: function () {
        return this.$store.state.Settings.settings.flightgearDirectory_traffic
      },
      apt_file: function () {
        return this.$store.state.Settings.settings.flightgearDirectory_apt
      },
      airports_directory: function () {
        return this.$store.state.Settings.settings.airportsDirectory
      },
      test_directory: function () {
        return this.$store.state.Settings.settings.testDirectory
      }
    }
  }
</script>

<style>
.el-row {
  margin-bottom: 10px;
}
.el-col {
  border-radius: 4px;
}
.label {
  padding: 10px;
  font-weight: bold;
}
.file-label {
  padding: 10px;
}
</style>
