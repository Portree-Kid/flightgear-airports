<template>
  <div>
    <span>
      <el-row>
        <el-col :span="6" class='text'>
          {{airport.icao}}
        </el-col>
        <el-col :span="10" class='text'>
          {{date}}
        </el-col>
        <el-col :span="6">
          <el-button @click="goto">Goto</el-button>
        </el-col>
      </el-row>
    </span>
  </div>
</template>
<script lang="js">
/* eslint-disable */
  export default  {
    name: 'airport',
    props: {airport: Object},
    mounted () {
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

      }
    },
    computed: {
      date: function () {        
        var d = new Date(this.airport.time)
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()        
      }
    }
  }


</script>

<style scoped lang="scss">
.text {
  padding: 10px;
}
</style>
