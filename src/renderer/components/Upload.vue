<template>
    <el-dialog title="Upload" :visible.sync="visible" width="30%" center>
      <span style="center">Upload {{icao}} to groundweb.</span><br/>
      <span style="center">E-Mail : {{this.$store.state.Settings.settings.email}}</span><br/>
      <span style="center"><el-checkbox v-model="gplv2">I agree to release the groundnet under GPL v2</el-checkbox></span><br/>
      <span style="center" v-if="message.length>0">{{message}}</span><br/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="upload" :disabled="!gplv2">Ok</el-button>
      </span>
    </el-dialog>
</template>

<script lang="js">
/* eslint-disable */
  import Vue from 'vue'
  const fs = require('fs')
  const path = require('path')

  export default {
    name: 'upload',
    props: [],
    mounted () {
    },
    data () {
      return {
        gplv2: false, message: ''
      }
    },
    methods: {
      upload () {
        var f = path.join(this.$store.state.Settings.settings.airportsDirectory, 
        this.icao[0], 
        this.icao[1], 
        this.icao[2], 
        this.icao + '.groundnet.new.xml');

        if (f == null || !fs.existsSync(f)) {
          this.message = 'File doesn\'t exist';
          return;
        }

        var data = fs.readFileSync(f, 'utf8').toString();
        var blob = new Blob([data]);
        var url = URL.createObjectURL(blob);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://groundweb.azurewebsites.net/groundnets/upload', true);

        // define new form
        var formData = new FormData();
        formData.append("gpl", this.gplv2 )
        formData.append("user_email", this.$store.state.Settings.settings.email)
        formData.append('groundnet', blob, this.icao + '.groundnet.xml');
        
        var parent = this.$parent;
        var messageField = this.message;
        // action after uploading happens
        xhr.onload = function(e) {
          console.log("File uploading completed! ");
          console.log(e);
          if (e.srcElement.status===500) {
            parent.$refs.upload.message == e.srcElement.statusText
          } else if(JSON.parse(e.srcElement.response).message.match('[A-Z0-9]* Imported Successfully')) {
            Vue.set(parent, 'uploadVisible', false)
          } else if(JSON.parse(e.srcElement.response).message === 'XML Errors') {
            var response = JSON.parse(e.srcElement.response);
            if (response.validationErrors) {
              response.validationErrors.forEach(element => {
                parent.$refs.upload.message += element.message + '\r\n';
              });
            }
          } else {            
            parent.$refs.upload.message = response.message;
          }
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
