<template>
  <div>
    <h1 class="leaflet-sidebar-header">
      Check Result
      <div class="leaflet-sidebar-close">
        <i class="fa fa-caret-left"></i>
      </div>
    </h1>
    <div id="panel" width="100%">
      <el-row v-if="!results || results.length === 0 "><h3>Check not run</h3></el-row>
      <el-row v-for="(result,idx) in results" :key="idx">
        <el-col :span="2" v-if="result.id==-1"><span class="label"><i class="far fa-check-circle"></i></span></el-col>
        <el-col :span="2" v-if="result.id>=0"><span class="label"><i class="fas fa-exclamation-triangle"></i></span></el-col>
        <el-col :span="2" v-if="result.id==-2"><span class="label"><i class="fas fa-exclamation-triangle"></i></span></el-col>
        <el-col :span="15">
        <el-popover
          placement="top-start"
          title="Description"
          width="200"
          trigger="hover"
          v-if="result.message"
          :content=result.message[1]
        >
          <span class="label" slot="reference">{{ result.message[0] }}</span>
        </el-popover>
        </el-col>
        <el-col :span="4" v-if="result.id>=0"><el-button v-on:click="show(result.id)" class="button"><i class="fas fa-bullseye"></i></el-button></el-col>
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
h3 {
  text-align: center;
}
.label {
  display: flex;
  justify-content: left;
  align-items: center;
  font-weight: normal;
}
</style>
