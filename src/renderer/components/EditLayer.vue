<template>
  <section class="edit-layer">
    <h1>edit-layer Component</h1>
  </section>
</template>

<script lang="js">
/* eslint-disable */
  import {LMap, LMarker} from 'vue2-leaflet'
  import L from 'leaflet'
  import LEdit from 'leaflet-editable/src/Leaflet.Editable.js'
  import {readGroundnetXML, addFeature} from '../loaders/groundnet_loader'
  import {extendTaxiSegment} from '../loaders/TaxiwaySegmentExtender'
  import {writeGroundnetXML} from '../loaders/groundnet_writer'
  import L2 from 'leaflet-textpath'

  // import {LSymbol} from 'leaflet-polylinedecorator'

  export default {
    name: 'edit-layer',
    props: [],
    created () {
      console.log(LMap)
      console.log(LMarker)
      console.log(L)
      console.log(LEdit)
      console.log(L2)
      // console.log(LSymbol)
    },
    mounted () {
      this.selectionLayerGroup = L.layerGroup();
      this.selectionLayerGroup.addTo(this.$parent.mapObject)
      this.$store.watch(
        function (state) {
              return state.Editable.data.node;
          },
          () => { this.editedNode() }
          /*
          (newValue, oldValue) => {
              console.log(`Updating from ${oldValue} to ${newValue}`);              
              //console.log(this.featureLookup[newValue.index]);
              console.log(this.component('editLayer'));
              //do something on data change
          }*/
          ,
          {
            deep: true //add this if u need to watch object properties change etc.
          }
        );
    },
    beforeDestroy () {
      this.remove()
    },
    data () {
      return {
        maxId: 1, icao: String
      }
    },
    methods: {
      load (icao, force) {        
        if (this.groundnetLayerGroup !== undefined) {
          this.groundnetLayerGroup.removeFrom(this.$parent.mapObject)
        }
        

        this.icao = icao
        this.groundnetLayerGroup = readGroundnetXML(this.$store.state.Settings.settings.airportsDirectory, icao, force)
        if (this.groundnetLayerGroup === undefined) {
          console.console.error('ICAO not loaded ' + icao)
          return
        }
        this.groundnetLayerGroup.eachLayer(l => {
          if (l instanceof L.TaxiwaySegment) {
            l.addListeners()
          }
        })
        /*
        this.groundnetLayerGroup.eachLayer(l => {
          if (l instanceof L.TaxiwaySegment) {
            var decorator = L.polylineDecorator(l, {
              pattern: [
              // defines a pattern of 10px-wide dashes, repeated every 20px on the line
                {offset: 5, repeat: 50, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})}
              ]
            })
            decorator.addTo(this.$parent.mapObject)
          }
        })
        */

        console.log(this.groundnetLayerGroup.maxId)

        this.groundnetLayerGroup.addTo(this.$parent.mapObject)
        this.icao = icao
      },
      visible (feature) {
        let bounds = this.$store.state.Settings.bounds

        let coordinates = feature.geometry.coordinates
        let ret = bounds.getNorthEast().lat > Number(coordinates[1]) &&
                  bounds.getNorthEast().lng > Number(coordinates[0])
        let ret2 = bounds.getSouthWest().lat < Number(coordinates[1]) &&
                  bounds.getSouthWest().lng < Number(coordinates[0])
        return ret && ret2
      },
      deferredMountedTo (parent) {
        this.layerGroup = L.layerGroup()
      },
      remove () {
        if (this.layerGroup) {
          this.$parent.removeLayer(this.layerGroup)
        }
      },
      add () {
        if (this.$parent._isMounted) {
          this.deferredMountedTo(this.$parent.mapObject)
        }
      },
      enableEdit () {
        this.editable = true
        this.featureLookup = [];
        this.groundnetLayerGroup.eachLayer(l => {
          l.enableEdit()
          
          l.featureLookup = this.featureLookup;
          if (typeof l.extensions === 'function') {
            l.extensions()
          }
          if (typeof l.bringToFront === 'function') {
            l.bringToFront()
          }
        })        
      },
      disableEdit () {
        this.editable = false
        this.groundnetLayerGroup.eachLayer(l => {
          l.disableEdit()
        })
      },
      deleteFeature () {
        switch (this.$store.state.Editable.type) {
          case 'node':
            this.removeNode(this.$store.state.Editable.index)
        }
      },
      removeNode (index) {
        this.featureLookup[index].forEach((element, i) => {
          if (element instanceof L.Polyline) {
            // element.latlngs.forEach();
            element._latlngs.forEach((e1, index1) => {
              console.log(e1);
              e1.__vertex.removeFrom(element.editor.editLayer);
              element._latlngs.splice(index1,1);
              if (element._latlngs.length==1) {
                this.featureLookup[index].splice(i,1);
                element.removeFrom(this.groundnetLayerGroup);
              }
            });
          }
        });
      },
      drawPolyline () {
        var polyLine = this.$parent.mapObject.editTools.startPolyline()
        polyLine.addTo(this.groundnetLayerGroup)
        polyLine.groundnetLayerGroup = this.groundnetLayerGroup;
        polyLine.attributes = [];

        polyLine.on('editable:vertex:new', event => {
          console.log(event)
          let closest = this.closestLayerSnap(event.latlng, 10)
          if (closest) {
            event.latlng.__vertex.glueindex = closest.glueindex;     
            event.latlng.__vertex.setLatLng(closest.latlng);
            this.featureLookup[event.latlng.__vertex.glueindex].push(event.latlng.__vertex);
            console.log(closest)
          } else {
            event.latlng.__vertex.glueindex = ++this.groundnetLayerGroup.maxId;
            this.featureLookup[event.latlng.__vertex.glueindex] = [];
          }
          event.latlng.attributes = [];
        })
        polyLine.on('editable:drawing:end', event => {
          event.target.featureLookup = this.featureLookup;
          extendTaxiSegment(event.target);
          event.target.addListeners()
          console.log(event)
          event.target.addTo(this.groundnetLayerGroup)
        })
      },
      editedNode() {
        var isOnRunway = Number(this.$store.state.Editable.data.node.isOnRunway);
        var isHoldPoint = this.$store.state.Editable.data.node.holdPointType !== 'none' &&
                          this.$store.state.Editable.data.node.holdPointType !== undefined;
        var nIndex = this.$store.state.Editable.index; 
        var hasRunwayNode = false;
        var hasHoldPointNode = false;
        var latlng;
        this.featureLookup[nIndex].forEach((element,index) => {
          if (element instanceof L.RunwayNode) {
            if (isOnRunway === 0) {
              // We shouldn't have a RunwayNode
              element.removeFrom(layerGroup);
              this.featureLookup[nIndex].splice(index,1);              
            }
            hasRunwayNode = true;
          } else if (element instanceof L.HoldNode) {
            if (!isHoldPoint) {
              // We shouldn't have a RunwayNode
              element.removeFrom(layerGroup);
              this.featureLookup[nIndex].splice(index,1);              
            } else {
              var fa_icon;
              if (this.$store.state.Editable.data.node.holdPointType === 'PushBack') {
                  fa_icon = "<div style='background-color:#4838cc;' class='marker-pin'></div><i class='fas fa-arrows-alt-h'></i>";
              } else if (this.$store.state.Editable.data.node.holdPointType === 'normal') {
                  fa_icon = "<div style='background-color:#4838cc;' class='marker-pin'></div><i class='fas fa-hand-paper'></i>";
              }
              const icon = new L.DivIcon({
                  className: 'custom-div-icon',
                  html: fa_icon,
                  iconSize: [30, 42],
                  iconAnchor: [15, 42]
              });

              element.setIcon(icon);
            }
            hasHoldPointNode = true;
          }
          else if (element instanceof L.ParkingSpot) {
          }
          else if (element instanceof L.TaxiwaySegment) {
              if (Number(element.begin) === nIndex) {
                latlng = element._latlngs[0];
              }
              if (Number(element.end) === nIndex) {
                latlng = element._latlngs[1];
              }
          }    
        })
        if (!hasRunwayNode && isOnRunway) {
          this.$store.state.Editable.data.node.holdPointType
          const icon = new L.DivIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:#4838cc;' class='marker-pin'></div><i class='fas fa-plane-departure'></i>",
              iconSize: [30, 42],
              iconAnchor: [15, 42]
          });
          const node = new L.RunwayNode(latlng, { icon: icon });
          node.glueindex = nIndex;
          node.addTo(layerGroup);
          this.featureLookup[nIndex].push(node);
          node.addListeners();
        }
        if (!hasHoldPointNode && isHoldPoint) {
          var fa_icon = null;
          if (this.$store.state.Editable.data.node.holdPointType === 'PushBack') {
              fa_icon = "<div style='background-color:#4838cc;' class='marker-pin'></div><i class='fas fa-arrows-alt-h'></i>";
          } else if (this.$store.state.Editable.data.node.holdPointType === 'normal') {
              fa_icon = "<div style='background-color:#4838cc;' class='marker-pin'></div><i class='fas fa-hand-paper'></i>";
          }
          const icon = new L.DivIcon({
              className: 'custom-div-icon',
              html: fa_icon,
              iconSize: [30, 42],
              iconAnchor: [15, 42]
          });
          const node = new L.HoldNode(latlng, { icon: icon });
          node.glueindex = nIndex;
          node.addTo(layerGroup);
          this.featureLookup[nIndex].push(node);
          node.addListeners();
        }
      },
      closestLayerSnap (eventLatlng, snap) {
        var layers = []
        this.groundnetLayerGroup.eachLayer((layer) => {
          if (layer instanceof L.Polyline) {
            // console.log(layer._latlngs)
            layer._latlngs.forEach(latlng => {
              if (latlng.__vertex) {
                let distance = latlng.distanceTo(eventLatlng)
                if (distance > 0 && distance < snap) {
                  layers.push({d: distance, l: layer, latlng: latlng.__vertex.latlng, glueindex: latlng.__vertex.glueindex})
                }
              }
            })
          } else if (layer instanceof L.RunwayNode) {
            let distance = layer._latlng.distanceTo(eventLatlng)
            if (distance > 0 && distance < snap) {
              layers.push({d: distance, l: layer, latlng: layer._latlng, glueindex: layer.glueindex})
            }
          } else if (layer instanceof L.ParkingSpot) {
            let distance = layer._latlng.distanceTo(eventLatlng)
            if (distance > 0 && distance < snap) {
              layers.push({d: distance, l: layer, latlng: layer._latlng, glueindex: layer.glueindex})
            }
          } else if (layer instanceof L.HoldNode) {
            let distance = layer._latlng.distanceTo(eventLatlng)
            if (distance > 0 && distance < snap) {
              layers.push({d: distance, l: layer, latlng: layer._latlng, glueindex: layer.glueindex})
            }
          } else {
            console.log(layer)
          }          
        })
        layers.sort((l1, l2) => l1.d - l2.d)
        if (layers.length > 0) {
          return layers[0]
        }
      },
      drawParking () {
        this.$parent.mapObject.on('click', this.addParking)
      },
      removeLayerClick (event) {
        console.log(event)
        this.groundnetLayerGroup.removeLayer(event.target)
      },
      addParking (event) {
        console.log(event.latlng)
        if (event.latlng === undefined) {
          return
        }
        const circle = new L.ParkingSpot(event.latlng, {attributes: {radius: 20, heading: 0}})
        circle.id = (++this.groundnetLayerGroup.maxId)
        circle.addTo(this.groundnetLayerGroup)
        circle.enableEdit()
        circle.extensions()
        circle.addListeners()
        addFeature(circle)
        // console.log(this.groundnetLayerGroup)
        this.$parent.mapObject.off('click', this.addParking)
      },
      reload (force) {
        this.load(this.icao, force)
      },
      save () {
        var xml = []
        this.groundnetLayerGroup.eachLayer(l => {
          console.log(l)
          xml.push(l)
        })
        writeGroundnetXML(this.$store.state.Settings.settings.airportsDirectory, this.icao, xml)
      },
    },
    computed: {
      edit: function () {
        console.log('Zoom : ' + this.$store.state.Settings.zoom)
        if (this.$store.state.Settings.zoom > 12) {
          console.log()
        }
      }
    }
}
</script>

<style scoped lang="css">
</style>
