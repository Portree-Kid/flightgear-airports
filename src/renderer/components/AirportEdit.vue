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
    <h1 class="leaflet-sidebar-header">{{ icao }} {{ name }}</h1>
    <div width="100%" >
        <el-row>
          <el-col :span="7"><span class="label"> Airlines :</span></el-col>
          <el-col :span="15">
            <el-tag v-for="item in airlines" :key="item.value">{{item.value}}</el-tag>
          </el-col>
          <el-col :span="2"><el-button @click="dialogVisible = true" v-if="editing" ><i class="fas fa-plus"></i></el-button></el-col>
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
  import Frequency from './Frequency'
  import ParkingList from './ParkingList'

export default {
    data () {
      return {activeTab: 'first', editing: false, dialogVisible: false, airlineCode: ''}
    },
    components: {
      Frequency, ParkingList
    },
    methods: {
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