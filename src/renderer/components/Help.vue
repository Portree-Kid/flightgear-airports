<template>
        <div class="leaflet-sidebar-pane" id="home">
            <h1 class="leaflet-sidebar-header">
                Help
                <div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div>
            </h1>
            <h2>Setup</h2>            
            <ol>
              <li>Set directories in settings (bottom left)</li>
              <li>Start scans one after the other in sidebar with magnifying glass.</li>              
            </ol>
            <h2>Search</h2>
            You can search for airports with ICAO or parts of the name. Only airports with flights are shown. 
            If you want to view another one it will be added when you type the full ICAO.
            <h2>World view</h2>
            <p>
              When zoomed out you will see circles. Their size corresponds with the number of flights. 
              Blue means Ok. Yellow to little parking. Red no groundnet.
            </p>
            <h2>Edit view</h2>
            <p>
            </p>
            <ul>
              <li>Button with ICAO code opens the Airport data in the edit tab.</li>
              <li>The top 4 buttons in the button bar are for zooming. </li>
              <li>Upload sends the current airport to groundweb.</li>
              <li>Edit switches into edit mode</li>
              <li>Undo undos all changes or all changes during session</li>
              <li>Save, saves the groundnet</li>
              <li>Draw taxiline</li>
              <li>Add parking</li>
              <li>Remove element, removes the currently selected element</li>
              <li>Check triggers the groundnet check.</li>
            </ul>
        </div>
</template>

<script lang="js">
  export default {
    name: 'help',
    props: [],
    mounted () {

    },
    data () {
      return {

      }
    },
    methods: {

    },
    computed: {

    }
}
</script>

<style scoped lang="scss">
</style>
