<template>
  <label class="directory-select">
    <div class="select-button">
      ...
    </div>
    <input type="file" @change="handleFileChange" webkitdirectory directory/>
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
      var first = e.target.files[0].webkitRelativePath.split("/")[0];
      var webkitdirectoryPath = e.target.files[0].path.split(first)[0] + first;
      this.$emit('input', webkitdirectoryPath)
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
}

.directory-select > input[type="file"] {
  display: none;
}
</style>