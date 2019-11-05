<template>
</template>

<script lang="js">
  export default {
    name: 'settings-panel',
    props: [],
    mounted () {
      if (this.$parent._isMounted) {
        this.$parent.sidebar.addPanel({
          id: 'settings',
          tab: '<i class="fa fa-gear vertical-center"/>',
          title: 'Settings',
          pane: '<div id="settings-div"></div>'
        })
      }
    },

    data () {
      return {
        selected: 'Undefined'
      }
    },
    methods: {

    },
    computed: {

    }
}
</script>

<style scoped lang="scss">
</style>
