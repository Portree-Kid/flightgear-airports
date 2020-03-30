<template>
  <div>
    <h1 class="leaflet-sidebar-header">
      Parking List
      <div class="leaflet-sidebar-close">
        <i class="fa fa-caret-left"></i>
      </div>
    </h1>
    <el-container direction="vertical">
        <li v-for="p in parkings" v-bind:key="p.index">
          <ParkingItem :parking="p"></ParkingItem>
        </li>
    </el-container>
  </div>
</template>

<script lang="js">
  import ParkingItem from './ParkingItem'
  export default {
    name: 'parking-list',
    components: {ParkingItem},
    props: [],
    data () {
      return {
      }
    },
    computed: {
      parkings: {
      // getter
        get: function () {
          if (this.$store.state.Parkings.items !== undefined) {
            return this.$store.state.Parkings.items
          }
        },
        // setter
        set: function (newValue) {
        }
      }
    }
}
</script>
