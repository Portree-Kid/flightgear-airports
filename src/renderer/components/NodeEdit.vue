<template>
  <div>
    <h1 class="leaflet-sidebar-header" v-if="node">
      Node Properties
      <div class="leaflet-sidebar-close">
        <i class="fa fa-caret-left"></i>
      </div>
    </h1>
    <div width="100%" v-if="node">
      <div>
        <el-row>
          <el-col :span="7">
            <span class="demo-input-label">Is on runway :</span>
          </el-col>
          <el-col :span="15">
            <el-switch v-model="isOnRunway"></el-switch>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="7">
            <span class="demo-input-label">Holdpoint Type :</span>
          </el-col>
          <el-col :span="15">
            <el-select v-model="holdPointType" placeholder="Select">
              <el-option
                v-for="type in options"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              ></el-option>
            </el-select>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script lang="js">
  export default {
    /*
    methods: {
      updateIsOnRunway (value) {
        this.$store.commit('SET_EDIT_ISONRUNWAY', value)
      }
    },
    */
    computed: {
      options: function () {
        return [{value: 'none', label: 'none'}, {value: 'PushBack', label: 'PushBack'}, {value: 'normal', label: 'normal'}, {value: 'CAT II/III', label: 'CAT II/III'}]
      },
      node: function () {
        return this.$store.state.Editable.type === 'node'
      },
      // {index: 39, lat: "N58 27.343", lon: "W03 5.153", isOnRunway: 0, holdPointType: "none"}
      isOnRunway: {
      // getter
        get: function () {
          return this.$store.state.Editable.data.node.isOnRunway === 1
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_ISONRUNWAY', newValue ? 1 : 0)
        }
      },
      holdPointType: {
      // getter
        get: function () {
          if (this.$store.state.Editable.data.node.holdPointType === undefined) {
            return 'none'
          }
          return this.$store.state.Editable.data.node.holdPointType
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_HOLDPOINTTYPE', newValue)
        }
      }
    }
  }
</script>
