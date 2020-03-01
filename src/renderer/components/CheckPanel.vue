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
        <el-col :span="7">{{ result.id }}</el-col>
        <el-col :span="15">{{ result.message }}</el-col>
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
  margin-bottom: 1px;
}
.el-col {
  border-radius: 1px;
}
</style>
