<template>
  <label class="directory-select">
    <div class="select-button">
      ...
    </div>
    <input name="hiddenDir" type="file" v-on:change="handleFileChange($event)" webkitdirectory directory tabindex="-1"/>
  </label>
</template>

<script>
/* eslint-disable */
  const path = require('path');
  const fs = require('fs');
  
  export default {

  props: {
    value: File
  },

  methods: {
    handleFileChange (e) {
      try {
        if (e.target.files && e.target.files.length>0) {
          var first = e.target.files[0].webkitRelativePath.split("/")[0];
          var webkitdirectoryPath = e.target.files[0].path.split(first)[0] + first;
          this.$emit('input', webkitdirectoryPath)          
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.directory-select > .select-button {
  padding: 0rem;

  color: white;
  background-color: #2EA169;

  border-radius: .3rem;

  text-align: center;
  font-weight: bold;
  width: 28px;
  height: 28px;
}

.directory-select > input[type="file"] {
  display: none;
}
</style>