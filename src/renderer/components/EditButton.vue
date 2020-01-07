<template></template>

<script lang="js">
  import L from 'leaflet'
  import '@fortawesome/fontawesome-free/css/all.css'
  import EditBar from '../leaflet/EditControl.js'
  export default {
    name: 'edit-bar',
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
      console.debug(L)
      console.debug(EditBar)
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
        this.editbutton = new L.EditControl({html: `<i class="${this.icon}"></i>`, callback: this.click, tooltip: this.tooltip})
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