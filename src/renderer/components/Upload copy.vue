<template>
    <el-dialog title="Upload" :visible.sync="visible" width="30%" center>
      <form ref="request_form" method="post" enctype="multipart/form-data" 
      action="http://groundweb.azurewebsites.net/groundnets/upload" 
      target="result">
        <label>Email (not checked but used for commit)</label> 
        <input name="user_email" type="text"/><BR/>
        <label>I agree to release my content under the GPL v2 </label> <input name="gpl" type="checkbox"/>    
        <br/>
        <label>Your groundnet file (groundnet/rwyuse)
          <input name="groundnet" type="file" size="50" accept="text/*"> 
        </label>  
        <el-button @click="upload">Ok</el-button>
      </form>
    </el-dialog>
</template>

<script lang="js">
/* eslint-disable */
  import Vue from 'vue'
  export default {
    name: 'upload',
    props: [],
    mounted () {
    },
    data () {
      return {
        gplv2: false
      }
    },
    methods: {
      upload () {
        this.$refs.request_form.$el.submit()
        Vue.set(this.$parent, 'uploadVisible', false)
      },
      upload2 () {
        var blob = new Blob([JSON.stringify(data)]);
        var url = URL.createObjectURL(blob);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'myForm.php', true);

        // define new form
        var formData = new FormData();
        formData.append('someUploadIdentifier', blob, 'someFileName.json');

        // action after uploading happens
        xhr.onload = function(e) {
          console.log("File uploading completed!");
        };

        // do the uploading
        console.log("File uploading started!");
        xhr.send(formData);
      }
    },
    computed: {
      visible: {
      // getter
        get: function () {
          return this.$attrs.visible
        },
        // setter
        set: function (newValue) {
          Vue.set(this.$parent, 'uploadVisible', newValue)
        }
      },
      icao: {
        get: function () {
          return this.$parent.$parent.$parent.icao
        },
        set: function (newValue) {
        }
      }
    }
}
</script>

<style scoped lang="scss">
  .center { text-align: center;}
</style>
