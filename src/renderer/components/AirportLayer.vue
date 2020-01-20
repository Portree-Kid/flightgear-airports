<template>
  <section class="edit-layer">
    <h1>edit-layer Component</h1>
  </section>
</template>

<script lang="js">
  import L from 'leaflet'
  export default {
    name: 'edit-layer',
    props: [],
    mounted () {
      this.add()
    },
    beforeDestroy () {
      this.remove()
    },
    data () {
      return {

      }
    },
    methods: {
      deferredMountedTo (parent) {
        this.sidebar = L.control.sidebar({
          autopan: false, // whether to maintain the centered map point when opening the sidebar
          closeButton: true, // whether t add a close button to the panes
          container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
          position: 'left' // left or right
        })
        parent.addControl(this.sidebar)
      },
      remove () {
        if (this.sidebar) {
          this.$parent.removeLayer(this.sidebar)
        }
      },
      add () {
        if (this.$parent._isMounted) {
          this.deferredMountedTo(this.$parent.mapObject)
        }
      }
    },
    computed: {

    }
}
</script>

<style scoped lang="scss">
</style>
