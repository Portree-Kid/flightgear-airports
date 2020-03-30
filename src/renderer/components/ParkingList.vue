<template>
  <div>
    <h1 class="leaflet-sidebar-header">
      Parking List
      <div class="leaflet-sidebar-close">
        <i class="fa fa-caret-left"></i>
      </div>
    </h1>
    <el-container direction="vertical">
      <el-row>
        <li v-for="p in parkings" v-bind:key="p.index">
          <el-link type="primary" @click="show(p.index)">{{p.name}} {{p.number}}</el-link>
        </li>
      </el-row>
    </el-container>
  </div>
</template>

<script lang="js">
  export default {
    name: 'parking-list',
    props: [],
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
      parkings: {
      // getter
        get: function () {
          if (this.$store.state.Parkings.items !== undefined) {
            return this.$store.state.Parkings.items.sort((p1, p2) => {
              if (p1.name === p2.name) {
                return p1.number.localeCompare(p2.number)
              } else {
                return p1.name.localeCompare(p2.name)
              }
            })
          }
        },
        // setter
        set: function (newValue) {
        }
      }
    }
}
</script>
