<template>
  <div>
    <span>
      <el-row>
        <el-col :span="7">
          <el-select v-model="type" placeholder="Select">
            <el-option
              v-for="type in options"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="13">
          <el-input
            placeholder="Please input frequency"
            v-model="value"
            :disabled="!editing"
            v-bind:class="{ invalid: !ok && editing}"
          ></el-input>
        </el-col>
        <el-col :span="2">
          <el-button @click="remove" v-if="editing" ><i class="fas fa-trash-alt"></i></el-button>
        </el-col>
      </el-row>
    </span>
  </div>
</template>
<script lang="js">
  import EditButton from './EditButton'
/* eslint-disable */
  export default  {
    name: 'frequency',
    components: { EditButton },
    props: {frequency: Object},
    mounted () {
    },
    data () {
      return {
        ok: true
      }
    },
    methods: {
      remove () {
        this.$store.dispatch('removeFrequency', this.frequency)
      },
      isValid (frequency) {
        let ok = frequency >= 118 && frequency <= 137
        if (!ok) {
          return false
        }
        let fractions = (frequency - Math.trunc(frequency)) * 1000
        let subFraction = Math.round(fractions % 25)
        switch (subFraction) {
          case 0:
            break
          case 5:
            break
          case 10:
            break
          case 15:
            break
          case 25:
            break
          default:
            return false
        }
        return true
      }
    },
    computed: {
      editing: function () {
        return this.$parent.$parent.$parent.$parent.$parent.$refs.editLayer.editing
      },
      options: function () {
        return [
          {value: 'AWOS', label: 'AWOS'},
          {value: 'GROUND', label: 'GROUND'},
          {value: 'TOWER', label: 'TOWER'},
          {value: 'APPROACH', label: 'APPROACH'},
          {value: 'DEPARTURE', label: 'DEPARTURE'}
        ]
      },
      type: {
      // getter
        get: function () {
          return this.frequency.type;
        },
        // setter
        set: function (newValue) {
          this.frequency.type = newValue;
        }
      },
      value: {
      // getter
        get: function () {
          return this.frequency.value;
        },
        // setter
        set: function (newValue) {
          this.frequency.value = newValue;
          ok = this.isValid(newValue);
        }
      }
    }
  }
</script>

<style scoped lang="scss">
.invalid {
  padding: 1px;
  background-color: red;
}
</style>
