<template></template>

<script lang="js">
  import L from 'leaflet'
  import '@fortawesome/fontawesome-free/css/all.css'
  import ToolControl from '../leaflet/ToolControl.js'
  export default {
    name: 'edit-bar',
    components: { ToolControl, L },
    props: {
      icon: String,
      show: Boolean,
      tooltip: String
    },
    watch: {
      show: function (newVal, oldVal) { // watch it
        console.log('Prop changed: ', newVal, ' | was: ', oldVal)
        if (newVal) {
          this.add()
        } else {
          this.remove()
        }
      }
    },
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
        this.editbutton = new L.ToolControl({html: `<i class="${this.icon}"></i>`, callback: this.click, tooltip: this.tooltip})
        if (this.show) {
          parent.addControl(this.editbutton)
        }
      },
      click () {
        // console.log(parent)
        this.$emit('click')
      },
      remove () {
        if (this.editbutton) {
          this.$parent.$parent.mapObject.removeControl(this.editbutton)
        }
      },
      add () {
        if (this.$parent.$parent._isMounted) {
          this.deferredMountedTo(this.$parent.$parent.mapObject)
        }
      }
    },
    computed: {
    }
}
</script>

<style scoped lang="scss">
</style>