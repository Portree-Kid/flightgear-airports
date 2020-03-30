<template>
  <el-link type="primary" @click="show(parking.index)">{{parking.name}} {{parking.number}}</el-link>
</template>

<script lang="js">
  export default {
    name: 'parking-item',
    props: {parking: Object},
    mounted () {
    },
    data () {
      return {
      }
    },
    methods: {
      show (idx) {
        this.$parent.$parent.$parent.$parent.$parent.$refs.editLayer.show(idx)
      }
    },
    computed: {
    }
}
</script>

<style scoped lang="scss">
</style>
