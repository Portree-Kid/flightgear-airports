<template>
  <div>
    <h1 class="leaflet-sidebar-header">
      Check Result
      <div class="leaflet-sidebar-close">
        <i class="fa fa-caret-left"></i>
      </div>
    </h1>
    <div id="panel" width="100%">            
      <el-row v-for="(result,idx) in results" :key="idx">
        <el-col :span="15">{{ result.message }}</el-col>
        <el-col :span="7"><el-button v-on:click="show(result.id)" class="button"><i class="fas fa-bullseye"></i></el-button></el-col>         
      </el-row>
    </div>
  </div>
</template>

<script lang="js">
  export default {
    name: 'settings-panel',
    components: {},
    props: [],
    mounted () {
    },
    data () {
      return {
      }
    },
    methods: {
      show (idx) {
        this.$parent.$parent.$parent.$refs.editLayer.show(idx)
      }
    },
    computed: {
      results: function () {
        return this.$store.state.Check.results
      }
    }
  }
</script>

<style>
.el-row {
  margin: 1px;
}
.el-col {
  border-radius: 1px;
  padding: 0pt;
}
.button {
  padding-left: 10px;
  padding-right: 10px;
}
</style>
