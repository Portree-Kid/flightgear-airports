<template>
<div>
  <el-link v-if="!editing" type="primary" @click="show(parking.index)">{{parking.name}} {{number}} {{parking.type}}</el-link>          
  <el-input @focus="show(parking.index)" v-if="editing" placeholder="Name" v-model="name" class="wide"></el-input>
  <el-input @focus="show(parking.index)" v-if="editing" placeholder="Number" v-model="number" class="narrow"></el-input>
  <el-select @focus="show(parking.index)" v-if="editing" v-model="parking_type" placeholder="Select">
          <el-option
            v-for="type in options"
            :key="type.value"
            :label="type.label"
            :value="type.value"
            :disabled="type.disabled"
          ></el-option>
        </el-select>
</div>
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
      options: function () {
        return [{value: 'none', label: 'none', disabled: true},
          {value: 'ga', label: 'general aviation'},
          {value: 'cargo', label: 'cargo'},
          {value: 'gate', label: 'commercial passenger traffic'},
          {value: 'mil-fighter', label: 'military fighter'},
          {value: 'mil-cargo', label: 'military cargo'}
        ]
      },
      editing: {
      // getter
        get: function () {
          return this.$parent.$parent.$parent.$parent.$parent.$refs.editLayer.getEditing()
        },
        // setter
        set: function (newValue) {
        }
      },
      name: {
      // getter
        get: function () {
          return this.parking.name
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_ITEM_NAME', [this.parking.index, newValue])
        }
      },
      number: {
      // getter
        get: function () {
          return this.parking.number
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_ITEM_NUMBER', [this.parking.index, newValue])
        }
      },
      parking_type: {
      // getter
        get: function () {
          if (this.parking.type === undefined) {
            return 'none'
          }
          return this.parking.type
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_ITEM_TYPE', [this.parking.index, newValue])
        }
      }

    }
}
</script>

<style scoped lang="scss">
div {
  display: flex;
  justify-content: space-between;
}
div.wide {
  width: 40%;
}
div.narrow {
  width: 20%;
}

</style>
