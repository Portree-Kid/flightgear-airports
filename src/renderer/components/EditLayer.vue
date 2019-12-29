<template>
  <section class="edit-layer">
    <h1>edit-layer Component</h1>
  </section>
</template>

<script lang="js">
  import { LMap, LMarker } from 'vue2-leaflet'
  import L from 'leaflet'

  export default {
    name: 'edit-layer',
    props: [],
    mounted () {
      console.log(LMap)
      console.log(LMarker)
      console.log(L)
      this.$store.dispatch('getAirports')
      console.log(this.$store.state.Airports.airports)
      LMap.on('dragend', function onDragEnd () {
        var width = L.Map.getBounds().getEast() - L.Map.getBounds().getWest()
        var height = L.Map.getBounds().getNorth() - L.Map.getBounds().getSouth()
        console.log(
          'center:' + L.Map.getCenter() + '\n' +
          'width:' + width + '\n' +
          'height:' + height + '\n' +
          'size in pixels:' + L.Map.getSize()
        )
      })
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
        console.log(parent)
        console.log(L)
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
  .edit-layer {

  }
</style>
