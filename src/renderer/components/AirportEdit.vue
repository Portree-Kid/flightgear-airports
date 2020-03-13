<template>
  <div>
    <div width="100%" v-if="airport">
        <el-row>
          <el-col :span="7">ICAO :</el-col>
          <el-col :span="15">{{ icao }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Name :</el-col>
          <el-col :span="15">{{ name }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Flights :</el-col>
          <el-col :span="15">{{ flights }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Airlines :</el-col>
          <el-col :span="15">{{ airlines }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Groundnet :</el-col>
          <el-col :span="15">{{groundnet}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Parking Positions :</el-col>
          <el-col :span="15">{{ parking }}</el-col>
        </el-row>
    </div>
    <el-divider></el-divider>    
    <div v-if="airport">
        <el-row>
          <el-col :span="7">AWOS :</el-col>
          <el-col :span="15"><el-input placeholder="Please input AWOS frequency" v-model="AWOS" 
          :disabled="!editing"
          v-bind:class="{ invalid: !awosOk && editing}">></el-input></el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Ground :</el-col>
          <el-col :span="15"><el-input placeholder="Please input GROUND frequency" v-model="GROUND"
          :disabled="!editing"
           v-bind:class="{ invalid: !groundOk && editing}"></el-input></el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Tower :</el-col>
          <el-col :span="15"><el-input placeholder="Please input TOWER frequency" v-model="TOWER" 
          :disabled="!editing"
          v-bind:class="{ invalid: !towerOk && editing}"></el-input></el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Approach :</el-col>
          <el-col :span="15"><el-input placeholder="Please input APPROACH frequency" v-model="APPROACH" 
          :disabled="!editing"
          v-bind:class="{ invalid: !approachOk && editing}"></el-input></el-col>
        </el-row>
        <el-row>
          <el-col :span="7">Departure :</el-col>
          <el-col :span="15"><el-input placeholder="Please input DEPARTURE frequency" v-model="DEPARTURE" 
          :disabled="!editing"
          v-bind:class="{ invalid: !departureOk && editing}"></el-input></el-col>
        </el-row>
    </div>
  </div>
</template>

<script lang="js">
  export default {
    data () {
      return { awosOk: true, groundOk: true, towerOk: true, approachOk: true, departureOk: true }
    },
    methods: {
      isValid (frequency) {
        let ok = frequency >= 118 && frequency <= 137
        if (!ok) {
          return false
        }
        let fractions = (frequency - Math.trunc(frequency)) * 1000
        let subFraction = Math.round(fractions % 25)
        switch (subFraction) {
          case 0:
            break
          case 5:
            break
          case 10:
            break
          case 15:
            break
          case 25:
            break
          default:
            return false
        }
        return true
      }
    },
    computed: {
      editing: function () {
        return this.$parent.$parent.$parent.$refs.editLayer.editing
      },
      icao: function () {
        return this.$store.state.Editable.data.airport.icao
      },
      name: function () {
        return this.$store.state.Editable.data.airport.name
      },
      flights: function () {
        return this.$store.state.Editable.data.airport.flights
      },
      airlines: function () {
        return this.$store.state.Editable.data.airport.airlines
      },
      groundnet: function () {
        return this.$store.state.Editable.data.airport.groundnet
      },
      parking: function () {
        return this.$store.state.Editable.data.airport.parking
      },
      airport: function () {
        return this.$store.state.Editable.type === 'airport'
      },
      AWOS: {
        // getter
        get: function () {
          let newValue = (this.$store.state.Frequencies.AWOS / 100).toFixed(3)
          this.awosOk = this.isValid(newValue)
          return newValue
        },
        // setter
        set: function (newValue) {
          this.awosOk = this.isValid(newValue)
          this.$store.dispatch('setAwos', newValue * 100)
        }
      },
      GROUND: {
        // getter
        get: function () {
          let newValue = (this.$store.state.Frequencies.GROUND / 100).toFixed(3)
          this.groundOk = this.isValid(newValue)
          return newValue
        },
        // setter
        set: function (newValue) {
          this.groundOk = this.isValid(newValue)
          this.$store.dispatch('setGround', newValue * 100)
        }
      },
      TOWER: {
        // getter
        get: function () {
          let newValue = (this.$store.state.Frequencies.TOWER / 100).toFixed(3)
          this.towerOk = this.isValid(newValue)
          return newValue
        },
        // setter
        set: function (newValue) {
          this.towerOk = this.isValid(newValue)
          this.$store.dispatch('setTower', newValue * 100)
        }
      },
      APPROACH: {
        // getter
        get: function () {
          let newValue = (this.$store.state.Frequencies.APPROACH / 100).toFixed(3)
          this.approachOk = this.isValid(newValue)
          return newValue
        },
        // setter
        set: function (newValue) {
          this.approachOk = this.isValid(newValue)
          this.$store.dispatch('setApproach', newValue * 100)
        }
      },
      DEPARTURE: {
        // getter
        get: function () {
          let newValue = (this.$store.state.Frequencies.DEPARTURE / 100).toFixed(3)
          this.departureOk = this.isValid(newValue)
          return newValue
        },
        // setter
        set: function (newValue) {
          this.departureOk = this.isValid(newValue)
          this.$store.dispatch('setDeparture', newValue * 100)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
   .el-row {
     padding: 0em
   }
   .invalid {
     padding: 1px;
     background-color: red;
   }
</style>