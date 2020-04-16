<template>

  <section class="ai-layer">
    <h1>ai-layer Component</h1>
  </section>

</template>

<script lang="js">
  import {aiLayer} from '../phi/AILayer'

  export default {
/* eslint-disable */
    name: 'ai-layer',
    props: [],
    mounted () {
      this.aiLayer = aiLayer({url: this.$store.state.Settings.settings.phi_url})
      this.aiLayer.addTo(this.$parent.mapObject)
    },
    data () {
      return {
      }
    },
    methods: {

    },
    computed: {

    }
}
</script>

<style scoped lang="scss">
  .ai-layer {

  }
</style>
