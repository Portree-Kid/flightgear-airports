<template>
  <div>
    <!--
    <h1 class="leaflet-sidebar-header">
      Parking List
      <div class="leaflet-sidebar-close">
        <i class="fa fa-caret-left"></i>
      </div>
    </h1>
    --> 
      <el-container direction="vertical">
          <div v-for="p in procedures" v-bind:key="p.index" class="row">
              <ProcedureItem :procedure="p"></ProcedureItem>
          </div>
      </el-container>
  </div>
</template>

<script lang="js">
  import ProcedureItem from './ProcedureItem'
  import {readProceduresXML, writeProceduresXML} from '../loaders/procedures_loader'

  export default {
    name: 'procedure-list',
    components: {ProcedureItem},
    props: {icao: String},
    mounted () {
      this.$store.watch(
        function (state) {
          return state.Airports.currentAirport
        },
        () => { readProceduresXML(this.$store.state.Settings.settings.airportsDirectory, this.$store.state.Airports.currentAirport.icao) }
        ,
        {
          deep: true //  add this if u need to watch object properties change etc.
        }
      )
    },
    data () {
      return {
      }
    },
    computed: {
      procedures: {
      // getter
        get: function () {
          if (this.$store.state.Procedures.items !== undefined) {
            return this.$store.state.Procedures.items
          }
        },
        // setter
        set: function (newValue) {
          console.log(newValue)
        }
      }
    },
    beforeUpdate: function () {
      console.log('beforeUpdate ProcedureList')
      this.$nextTick(function () {
        console.log('Loading Procedures', this.icao)
      })
    },
    methods: {
      createDefault () {
        writeProceduresXML(this.$store.state.Settings.settings.airportsDirectory, this.icao, this.procedures)
      }
    }
}
</script>

<style>
div.row.div {
  display: flex;
  justify-content: space-between;
}
</style>


