<template>
  <div id="BLABLA">
    <EditButton icon="fas fa-edit" v-on:click="edit" :show="!editing" tooltip="Edit"></EditButton>
    <EditButton icon="fas fa-undo" v-on:click="undo" :show="editing" tooltip="Undo"></EditButton>
    <EditButton icon="fas fa-save" v-on:click="save" :show="editing" tooltip="Save"></EditButton>

    <EditButton icon="fas fa-draw-polygon" :show="editing" tooltip="Draw Taxiline"></EditButton>
    <EditButton icon="fas fas fa-parking" :show="editing" tooltip="Draw Parking"></EditButton>
  </div>
</template>

<script lang="js">
  import EditButton from './EditButton'
  export default {
    components: { EditButton },
    data () {
      return {isEditing: false}
    },
    created () {
    },
    methods: {
      edit () {
        this.editing = true
        this.$parent.$parent.$refs.editLayer.enableEdit()
      },
      undo () {
        this.editing = false
        this.$parent.$parent.$refs.editLayer.disableEdit()
      },
      save () {
        this.editing = false
        this.$parent.$parent.$refs.editLayer.disableEdit()
      }
    },
    computed: {
      editing: {
      // getter
        get: function () {
          console.log(`Getting Visible : ${this.isEditing}`)
          return this.isEditing
        },
        // setter
        set: function (newValue) {
          this.isEditing = newValue
          console.log(`Setting Visible : ${this.isEditing}`)
        }
      }
    }
  }
</script>