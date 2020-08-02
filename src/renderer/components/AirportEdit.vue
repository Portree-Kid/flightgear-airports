<template>
  <div v-if="airport">
    <el-dialog
      title="Add Airline"
      :visible.sync="dialogVisible"
      width="20%"
      :before-close="handleClose">
      <span>Add an selectable airline to {{ icao }} {{ name }}</span>
          <el-input
            placeholder="Please input airline"
            v-model="airlineCode"
            maxlength="3"
          ></el-input>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addAirline">Confirm</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Import File"
      :visible.sync="showImportFile"
      width="20%"
      :before-close="handleClose">
        <span>Beware wip will be overwritten</span>
        <el-row>
          <el-col :span="20">
            <el-input
            placeholder="Please input file"
            v-model="fileImportName">
            </el-input>
          </el-col>
          <el-col :span="4">
            <file-select @input="fileImportFileName"></file-select>
          </el-col>
        </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showImportFile = false">Cancel</el-button>
        <el-button type="primary" @click="importFile">Confirm</el-button>
      </span>
    </el-dialog>
    <h1 class="leaflet-sidebar-header">{{ icao }} {{ name }}</h1>
    <div width="100%" >
        <el-row>
            <el-button @click="showImportFile = true" v-if="!editing" ><i class="fas fa-file-import"></i></el-button>
        </el-row>
        <el-row>
          <el-col :span="7"><span class="label"> Airlines :</span></el-col>
          <el-col :span="15">
            <el-tag v-for="item in airlines" :key="item.value">{{item.value}}</el-tag>
          </el-col>
          <el-col :span="2">
            <el-button @click="dialogVisible = true" v-if="editing" ><i class="fas fa-plus"></i></el-button>
          </el-col>
        </el-row>
    </div>
    <el-tabs v-model="activeTab" >
    <el-tab-pane label="Frequencies" name="first"> 
      <div>
        <el-row v-for="f in frequencyList" :key="f.index">
          <Frequency :frequency="f"></Frequency>
        </el-row>
        <el-button @click="addFrequency" v-if="editing" >Add</el-button>
        </div>
    </el-tab-pane>
    <el-tab-pane label="Parkings" name="second">
      <ParkingList></ParkingList>
    </el-tab-pane>
    <el-tab-pane label="Statistics" name="third">
        <el-row><el-col :span="8"><span class="label">Traffic :</span></el-col></el-row>
        <el-row>
          <el-col :span="8">Flights :</el-col>
          <el-col :span="4">{{ flights }}</el-col>
          <el-col :span="8"></el-col>
          <el-col :span="4"></el-col>
        </el-row>
        <el-row><el-col :span="16"><span class="label">GIT/Terrasync :</span></el-col></el-row>
        <el-row>
          <el-col :span="8">Parking Positions :</el-col>
          <el-col :span="4">{{ parking }}</el-col>
          <el-col :span="8">Groundnet Nodes :</el-col>
          <el-col :span="4">{{groundnet}}</el-col>
        </el-row>
        <el-row><el-col :span="8"><span class="label">Work :</span></el-col></el-row>
        <el-row v-if="wip">
          <el-col :span="8">Work Parking Positions :</el-col>
          <el-col :span="4">{{ wipparking }}</el-col>
          <el-col :span="8">Work Groundnet Nodes :</el-col>
          <el-col :span="4">{{wipgroundnet}}</el-col>
        </el-row>
        <el-row v-if="wip">
          <el-col :span="4">Saved :</el-col>
          <el-col :span="8" class="text">{{date}}</el-col>
          <el-col :span="4">Uploaded :</el-col>
          <el-col :span="8" class="text">{{upload_date}}</el-col>
        </el-row>
    </el-tab-pane>
  </el-tabs>
  </div>
</template>

<script lang="js">
  import EditButton from './EditButton'
  import FileSelect from './FileSelect'
  import Frequency from './Frequency'
  import ParkingList from './ParkingList'
  
  const fs = require('fs')
  const path = require('path')

export default {
    data () {
      return {showImportFile: false, activeTab: 'first', editing: false, dialogVisible: false, airlineCode: '', fileImport: null}
    },
    components: {
      EditButton, FileSelect, Frequency, ParkingList
    },
    methods: {
      fileImportFileName (f) {
        this.fileImport = f
      },
      importFile () {
        this.showImportFile = false
        var fDir = this.$store.state.Settings.settings.airportsDirectory
        var fNew = path.join(fDir, this.icao[0], this.icao[1], this.icao[2], this.icao + '.groundnet.new.xml')

        var editLayer = this.$parent.$parent.$parent.$refs.editLayer
        fs.copyFile(this.fileImport.path, fNew, () => {
          editLayer.reload(false)
        })
      },
      setEditing (editing) {
        this.editing = editing
      },
      addAirline () {
        this.dialogVisible = false
        this.$store.dispatch('addAirline', this.airlineCode)
      },
      addFrequency () {
        this.$store.dispatch('addFrequency', {type: 'AWOS', value: 0})
      },
      initLayer () {
        var parent = this.$parent
        while (parent !== undefined && parent.$refs.editLayer === undefined) {
          parent = parent.$parent
        }
        if (parent === undefined) {
          return
        }
        this.editLayer = parent.$refs.editLayer
      },
      handleClose () {
      }
    },
    computed: {
      fileImportName: function () {
        if (this.fileImport !== null) {
          console.log(this.fileImport)
          return this.fileImport.path
        }
        return 'Please select'
      },
      icao: function () {
        return this.$store.state.Airports.currentAirport.icao
      },
      name: function () {
        return this.$store.state.Airports.currentAirport.name
      },
      flights: function () {
        return this.$store.state.Airports.currentAirport.flights
      },
      airlines: function () {
        var airlineCodes = []
        if (this.$store.state.Airports.currentAirport !== undefined && this.$store.state.Airports.currentAirport.airlines) {
          var storedairlineCodes = this.$store.state.Airports.currentAirport.airlines
          storedairlineCodes.forEach(element => {
            airlineCodes.push({value: element, label: element})
          })
        }
        return airlineCodes
      },
      groundnet: function () {
        return this.$store.state.Airports.currentAirport.groundnet
      },
      parking: function () {
        return this.$store.state.Airports.currentAirport.parking
      },
      wipgroundnet: function () {
        return this.$store.state.Airports.currentAirport.wipgroundnet
      },
      wipparking: function () {
        return this.$store.state.Airports.currentAirport.wipparking
      },
      wip: function () {
        // .icao
        var wip = this.$store.state.Settings.wip.filter(w => w.icao === this.$store.state.Airports.currentAirport.icao)
        if (wip.length > 0) {
          return true
        }
        return false
      },
      date: function () {
        var wip = this.$store.state.Settings.wip.filter(w => w.icao === this.$store.state.Airports.currentAirport.icao)
        var d = new Date(wip[0].time)
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
      },
      upload_date: function () {
        var wip = this.$store.state.Settings.wip.filter(w => w.icao === this.$store.state.Airports.currentAirport.icao)
        if (wip[0].upload !== undefined) {
          var d = new Date(wip[0].upload)
          return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
        } else {
          return '-'
        }
      },
      airport: {
        get: function () {
          return this.$store.state.Airports.currentAirport !== undefined
        }
      },
      frequencyList: {
        // getter
        get: function () {
          return this.$store.state.Frequencies.items
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
   .el-row {
     padding: 0em;
     margin-bottom: 5px;
   }
.label {
  display: flex;
  justify-content: left;
  align-items: center;
  font-weight: bold;
}
</style>