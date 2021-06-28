<template>
  <div>
    <h1 class="leaflet-sidebar-header">
      Search
      <div class="leaflet-sidebar-close">
        <i class="fa fa-caret-left"></i>
      </div>
    </h1>
    <el-container direction="vertical">
      <el-input placeholder="Search" v-model="searchterm" class="input-with-select">
      </el-input>
    </el-container>
    <li v-for="item in searched" v-bind:key="item.icao"><el-link type="primary" @click="goto(item.icao)">{{ item.icao }} {{ item.name }}</el-link></li>
  </div>
</template>

<script lang="js">
  // import scanner from '../utils/scan'
  import {Table, TableColumn} from 'element-ui'

  export default {
    name: 'search',
    components: { [Table.name]: Table,
      [TableColumn.name]: TableColumn},
    props: [],
    mounted () {
    },
    beforeDestroy () {
    },
    data () {
      // this.$store.dispatch('getAirportsUnfiltered')
      return {searchterm: this.searchterm, lastSearchTerm: '', lastResult: {}}
    },
    methods: {
      goto (icao) {
        console.debug('Goto : ' + icao)
        let airports = this.$store.state.Airports.airports
          .filter(a => a.properties.icao.match(icao))
        if (airports.length > 0) {
          this.$store.commit('CENTER', [airports[0].geometry.coordinates[1], airports[0].geometry.coordinates[0]])
        }
      },
      formatter (row, column) {
        console.log('Row ' + row)
        return row
      }
    },
    computed: {
      searched: function () {
        console.debug('Search : ' + this.searchterm)
        if (this.searchterm !== this.lastSearchTerm) {
          let searchRegex = new RegExp(this.searchterm, 'i')
          let result = this.$store.state.Airports.airports
            .filter(point => point.geometry !== undefined)
            .filter(point => point.geometry.coordinates !== undefined)
            .filter(a => a.properties !== undefined)
            .filter(a => searchRegex.test(a.properties.icao) || searchRegex.test(a.properties.name))
            // .map(a => console.log(a.properties))
            .map(a => ({ icao: a.properties.icao, name: a.properties.name }))
            .filter((v, i, a) => a.findIndex(t => (t.icao === v.icao)) === i)
          let icaoResult = result.filter(a => a.icao === this.searchterm).filter((v, i, a) => a.findIndex(t => (t.icao === v.icao)) === i)
          if (result !== undefined &&
              icaoResult.length === 0 &&
              this.searchterm !== undefined &&
              this.searchterm.length >= 3 &&
              this.searchterm.length <= 4) {
            // Not found so it might have been excluded due to no traffic
            this.$store.dispatch('getAirport', this.searchterm)
          }
          this.lastResult = result
          this.lastSearchTerm = this.searchterm
          return result
        }
        return this.lastResult
      }
    }
}
</script>
