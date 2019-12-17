<template>
  <label class="directory-select">
    <div class="select-button">
      ...
    </div>
    <input type="file" @change="handleFileChange" webkitdirectory directory/>
  </label>
</template>

<script>
export default {
  props: {
    value: File
  },

  methods: {
    handleFileChange (e) {
      this.$emit('input', e.target.files[0])
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