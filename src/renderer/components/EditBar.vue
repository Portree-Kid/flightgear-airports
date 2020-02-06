<template>
  <div id="EditBar">
    <EditButton icon="fas fa-edit" v-on:click="edit" :show="!editing" tooltip="Edit"></EditButton>
    <EditButton icon="fas fa-undo" v-on:click="centerDialogVisible = true" :show="editing" tooltip="Undo"></EditButton>
    <el-dialog title="Reload" :visible.sync="centerDialogVisible" width="30%" center>
      <span style="center">Reload from last save? You will lose the current edits.</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="undoFirst">Base version (GIT)</el-button>
        <el-button type="primary" @click="undoLast">Last save</el-button>
      </span>
    </el-dialog>

    <EditButton icon="fas fa-save" v-on:click="save" :show="editing" tooltip="Save"></EditButton>
    <EditButton icon="fas fa-draw-polygon" v-on:click="drawPolyline" :show="editing" tooltip="Draw Taxiline"></EditButton>
    <EditButton icon="fas fa-parking" v-on:click="drawParking" :show="editing" tooltip="Draw Parking"></EditButton>
    <EditButton icon="fas fa-trash-alt" v-on:click="deleteFeature" :show="editing" tooltip="Remove"></EditButton>
  </div>
</template>

<script lang="js">
  import EditButton from './EditButton'
  export default {
    components: { EditButton },
    data () {
      return {isEditing: false, centerDialogVisible: false}
    },
    created () {
    },
    methods: {
      edit () {
        this.editing = true
        this.$parent.$parent.$refs.editLayer.enableEdit()
      },
      undoFirst () {
        this.editing = false
        this.centerDialogVisible = false
        this.$parent.$parent.$refs.editLayer.disableEdit()
        this.$parent.$parent.$refs.editLayer.reload(true)
      },
      undoLast () {
        this.editing = false
        this.centerDialogVisible = false
        this.$parent.$parent.$refs.editLayer.disableEdit()
        this.$parent.$parent.$refs.editLayer.reload(false)
      },
      save () {
        this.editing = false
        this.$parent.$parent.$refs.editLayer.save()
        this.$parent.$parent.$refs.editLayer.disableEdit()
      },
      drawPolyline () {
        this.$parent.$parent.$refs.editLayer.drawPolyline()
      },
      drawParking () {
        this.$parent.$parent.$refs.editLayer.drawParking()
      },
      deleteFeature () {
        this.$parent.$parent.$refs.editLayer.deleteFeature()
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