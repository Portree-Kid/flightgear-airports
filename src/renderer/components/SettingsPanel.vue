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
        <el-col :span="7" class="label">Export Directory</el-col>
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

        <el-col :span="7" class="label">Author E-Mail : </el-col>
        <el-col :span="17">
        <el-popover
          placement="top-start"
          title="E-Mail"
          width="200"
          trigger="hover"
          content="Only used as a committer/author for Github. This e-mail is only visible via GIT."
        >
            <el-input placeholder="Please input your email" slot="reference" v-model="email"></el-input>
        </el-popover>
        </el-col>
      </el-row>
      <el-row>

        <el-col :span="7" class="label">Author Name : </el-col>
        <el-col :span="17">
        <el-popover
          placement="top-start"
          title="Goto"
          width="200"
          trigger="hover"
          content="This is saved to the file and is therefore distributed via Terrasync."
        >
            <el-input placeholder="Please input your Name" slot="reference" v-model="name"></el-input>
        </el-popover>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="7">
          <span class="label">Scan logging :</span>
        </el-col>
        <el-col :span="15">
          <el-popover
            placement="top-start"
            title="Logging"
            width="200"
            trigger="hover"
            content="Switch on logging for scan. Big performance hit"
          >
            <el-switch v-model="scanLogging" slot="reference"></el-switch>
          </el-popover>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="7" class="label"></el-col>
        <el-col :span="17">
        <el-popover
          placement="top-start"
          title="Debug"
          width="200"
          trigger="hover"
          content="Opens the JavaScript Debugger for troubleshooting"
        >
          <el-button @click="debug" class="button"  slot="reference" >
            <i class="fas fa-bug"></i> Debugger
          </el-button>
        </el-popover>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="js">
  import FileSelect from './FileSelect'
  import DirectorySelect from './DirectorySelect'

  const { ipcRenderer } = require('electron')

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
        this.$store.commit('FLIGHTGEAR_DIRECTORY', flightgearDirectory)
      },
      airportsDirectorySelect: function (flightgearDirectory) {
        console.log(flightgearDirectory)
        this.$store.commit('AIPORTS_DIRECTORY', flightgearDirectory)
      },
      testDirectorySelect: function (testDirectory) {
        console.log(testDirectory)
        this.$store.commit('TEST_DIRECTORY', testDirectory)
      },
      debug: function () {
        ipcRenderer.send('OpenDebugger', 'ping')
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
      name: {
      // getter
        get: function () {
          return this.$store.state.Settings.settings.name
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_NAME', newValue)
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
      },
      scanLogging: {
      // getter
        get: function () {
          return this.$store.state.Settings.settings.scanLogging === 1
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_SCAN_LOGGING', newValue ? 1 : 0)
        }
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
