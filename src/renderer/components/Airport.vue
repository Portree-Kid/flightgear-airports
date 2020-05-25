<template>
  <div>
    <el-row>
      <el-col :span="3" class="text">{{airport.icao}}</el-col>
      <el-col :span="6" class="text">{{date}}</el-col>
      <el-col :span="6" class="text">{{upload_date}}</el-col>
      <el-col :span="9">
        <el-popover
          placement="top-start"
          title="Goto"
          width="200"
          trigger="hover"
          content="Center to airport"
        >
          <el-button @click="goto" class="button" slot="reference" :disabled="editing">
            <i class="fas fa-bullseye"></i>
          </el-button>
        </el-popover>
        <el-popover
          placement="top-start"
          title="Remove"
          width="200"
          trigger="hover"
          content="Remove this Work in progress file"
        >
          <el-button @click="remove" tooltip="Remove wip file" class="button" slot="reference" :disabled="editing">
            <i class="fas fa-trash-alt"></i>
          </el-button>
        </el-popover>
        <el-popover
          placement="top-start"
          title="Upload"
          width="200"
          trigger="hover"
          content="Upload work in progress"
        >
          <el-button @click="upload" tooltip="Upload to groundweb" class="button" slot="reference" :disabled="editing">
            <i class="fas fa-upload"></i>
          </el-button>
        </el-popover>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="js">
/* eslint-disable */
  const $ = require('jquery');
  import 'element-ui/lib/theme-chalk/index.css'
  import {removeWip} from '../loaders/groundnet_functions'

  export default  {
    name: 'airport',
    props: {airport: Object, editing: Boolean},
    mounted () {
      this.$forceUpdate();
    },
    data () {
      return {
        ok: true
      }
    },
    methods: {
      goto() {
        let airports = this.$store.state.Airports.airports
          .filter(a => a.properties.icao.match(this.airport.icao))
        if (airports.length > 0) {
          this.$store.commit('CENTER', [airports[0].geometry.coordinates[1], airports[0].geometry.coordinates[0]])
        }
      }, 
      remove() {
        removeWip(this.$store.state.Settings.settings.airportsDirectory, this.airport.icao)
        this.$store.dispatch('removeWip', this.airport.icao);
      },
      upload() {

      }
    },
    computed: {
      date: function () {        
        var d = new Date(this.airport.time)
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()        
      },
      upload_date: function () {        
        if( this.airport.upload !== undefined ) {
          var d = new Date(this.airport.upload)
          return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()        
        } else {
          return "-"
        }
      }
    }
  }


</script>

<style scoped lang="scss">
.text {
  padding: 10px;
}
.button {
  padding-left: 10px;
  padding-right: 10px;
}
.el-popover--plain {
    padding: 5px 5px;
}
</style>
