<template>

  <section class="work-in-progress">
            <h1 class="leaflet-sidebar-header">
                Work in progress
                <div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div>
            </h1>
    <div>
      <el-row>
        <el-col :span="3" class="text">
          ICAO
        </el-col>
        <el-col :span="7" class="text">
          Edited
        </el-col>
        <el-col :span="8" class="text">
          Uploaded
        </el-col>
        <el-col :span="6" class="text">
          Actions
        </el-col>
      </el-row>
        
        <el-row v-for="w in wip" :key="w.icao">
          <Airport :airport="w"></Airport>
        </el-row>
    </div>
  </section>
</template>

<script lang="js">
  import Airport from './Airport'
  export default {
    name: 'work-in-progress',
    props: [],
    components: {Airport},
    mounted () {
    },
    data () {
      return {
      }
    },
    methods: {
    },
    computed: {
      wip: function () {
        return this.$store.state.Settings.wip
      }
    }
}
</script>

<style scoped lang="scss">
.text {
  padding: 10px;
  font-weight: bold;
}
.el-row {
    margin-bottom: 0px;
}</style>
