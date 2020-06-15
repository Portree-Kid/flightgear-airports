<template></template>

<script lang="js">
/* eslint-disable */
  import {LMap, LMarker} from 'vue2-leaflet'
  import L from 'leaflet'
  import LEdit from 'leaflet-editable/src/Leaflet.Editable.js'
  import {readGroundnetXML, addFeature} from '../loaders/groundnet_loader'
  import {extendTaxiSegment} from '../loaders/TaxiwaySegmentExtender'
  import {writeGroundnetXML} from '../loaders/groundnet_writer'
  import L2 from 'leaflet-textpath'
  import Vue from 'vue'
  import { MessageBox } from 'element-ui';

  const Coordinates = require('coordinate-parser');
  const path = require('path')
  const fs = require('fs')

  var selectedItem

  // import {LSymbol} from 'leaflet-polylinedecorator'

  export default {
    name: 'edit-layer',
    components: {},
    props: [],
    created () {

      console.log(LMap)
      console.log(LMarker)
      console.log(L)
      console.log(LEdit)
      console.log(L2)
      console.log('Created Editlayer')
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
          ,
          {
            deep: true //add this if u need to watch object properties change etc.
          }
        );
      this.$store.watch(
        function (state) {
              return state.Editable.data.arc;
          },
          () => { this.editedArc() }
          ,
          {
            deep: true //add this if u need to watch object properties change etc.
          }
        );
      this.$store.watch(
        function (state) {
              return state.Editable.data.parking;
          },
          () => { this.editedParking() }
          ,
          {
            deep: true //add this if u need to watch object properties change etc.
          }
        );
      this.$store.watch(
        function (state) {
              return state.Parkings.items;
          },
          () => { this.editedParkings() }
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
        maxId: 1, icao: String, checking: false, editing: false
      }
    },
    methods: {
      load (icao, force) {        
        if (this.groundnetLayerGroup !== undefined) {
          this.groundnetLayerGroup.removeFrom(this.$parent.mapObject)
        }        
        this.$parent.$parent.setIcao(icao)
        this.icao = icao
        this.groundnetLayerGroup = readGroundnetXML(this.$store.state.Settings.settings.airportsDirectory, icao, force)
        if (this.groundnetLayerGroup === undefined) {
          console.error('ICAO not loaded ' + icao)
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
      showCheck() {
        Vue.set(this, 'checking', true)
      },
      getEditing () {
        return this.editing;
      },
      enableEdit () {
        this.editable = true
        this.editing = true
        this.$store.commit('SET_EDIT', true)
        
        this.featureLookup = [];
        this.groundnetLayerGroup.eachLayer(l => {
          l.enableEdit()
          
          l.featureLookup = this.featureLookup;
          if (typeof l.extensions === 'function') {
            l.extensions(this)
          }
          if (typeof l.bringToFront === 'function') {
            l.bringToFront()
          }
        })
        this.$store.dispatch('addWip', {icao: this.icao});      },
      disableEdit () {
        this.editable = false
        this.editing = false
        this.$store.commit('SET_EDIT', false)
        this.groundnetLayerGroup.eachLayer(l => {
          l.disableEdit()
        })
      },
      deleteFeature () {
        switch (this.$store.state.Editable.type) {
          case 'node':
            this.removeNode(this.$store.state.Editable.index)
            break;
          case 'runway':
            this.removeNode(this.$store.state.Editable.index)
            break;
          case 'parking':
            this.removeParking(this.$store.state.Editable.index)
            break;
          case 'arc':
            this.removeArc(this.$store.state.Editable.data.arc)
            break;
          default:
            console.log('Remove : ' + this.$store.state.Editable.type)
        }
      },
      findRouteToPushback (index) {
        if (this.featureLookup===undefined || this.featureLookup[index]===undefined) {
          return
        }
        var parking = this.featureLookup[index].filter(n => n instanceof L.ParkingSpot)  
        var walkedNodes = [index]
        var pushBackNodes = []
        this.walkPushbackRoute(index, walkedNodes, pushBackNodes)
        return pushBackNodes
      },
      walkPushbackRoute (index, walkedNodes, pushBackNodes) {
        var polyLines = this.featureLookup[index].filter(n => n instanceof L.Polyline)
        var holdNodes = this.featureLookup[index].filter(n => n instanceof L.HoldNode)
        holdNodes.forEach(n => {
          pushBackNodes.push(Number(n.glueindex));
        });

        polyLines.forEach(l => {
          if( l.options.attributes.isPushBackRoute === 1 ) {
            if (Number(l.begin) === index && walkedNodes.indexOf(Number(l.end)) < 0) {
              walkedNodes.push(Number(l.end))
              pushBackNodes.concat(this.walkPushbackRoute(Number(l.end), walkedNodes, pushBackNodes))
            }
            if (Number(l.end) === index && walkedNodes.indexOf(Number(l.begin)) < 0 ) {
              walkedNodes.push(Number(l.begin))
              pushBackNodes.concat(this.walkPushbackRoute(Number(l.begin), walkedNodes, pushBackNodes))
            }
          }
        });
      },
      removeArc (arc) {        
        console.log(arc);
        var arcLayer = this.groundnetLayerGroup.getLayer(this.$store.state.Editable.index);
        arcLayer.removeFrom(this.groundnetLayerGroup);        
      },
      removeParking (index) {
        if(this.featureLookup[index]===undefined) {
          console.error("Lookup " + index + " failed ");          
          return;
        }
        this.featureLookup[index].forEach((element, i) => {
          if (element instanceof L.ParkingSpot) {
            element.removeFrom(this.groundnetLayerGroup);                      
          }
        });
      },
      show (index) {
        if(Number.isNaN(index)) {
          return;
        }        
        if(this.featureLookup===undefined || this.featureLookup[index]===undefined) {
          console.error("Lookup " + index + " failed ");          
          this.buildLookup()
        }
        if (Number(this.$store.state.Editable.index) >= 0 &&
          this.featureLookup[this.$store.state.Editable.index]!==undefined) {
            this.featureLookup[this.$store.state.Editable.index].forEach(element => {
              element.deselect();
            });
        }

        this.featureLookup[index].forEach((element, i) => {
          if (element instanceof L.Polyline) {
            element._latlngs.forEach((e1, index1) => {
              console.log(e1);
              if (e1.attributes.index===index) {
                var latlng = {};
                latlng.lat =  e1.lat;
                latlng.lng =  e1.lng;
                this.$store.dispatch('setCenter', latlng);
                if(e1.__vertex._icon.style!=null) {
                    e1.__vertex._icon.style['background-color'] = 'red';
                }
                return;
              }
            });
          } else if (element instanceof L.RunwayNode) {
            var latlng = {};
            latlng.lat =  element._latlng.lat;
            latlng.lng =  element._latlng.lng;
            if (this.selectedItem != null && this.selectedItem.deselect !== undefined) {
              this.selectedItem.deselect();
            }
            this.selectedItem = element;
            element.select();
            this.$store.dispatch('setCenter', latlng);
          } else if (element instanceof L.ParkingSpot) {
            console.log(element);
            var latlng = {};
            latlng.lat =  element._latlng.lat;
            latlng.lng =  element._latlng.lng;
            if (this.selectedItem != null && this.selectedItem.deselect !== undefined) {
              this.selectedItem.deselect();
            }
            this.selectedItem = element;
            element.select();
            this.$store.dispatch('setCenter', latlng);
          }
        });
      },
      buildLookup () {
        this.featureLookup = {};
        this.groundnetLayerGroup.eachLayer((layer) => {
          if (layer instanceof L.Polyline) {
            // console.log(layer._latlngs)
            layer._latlngs.forEach(latlng => {
              if (latlng.attributes.index) {
                if( this.featureLookup[latlng.attributes.index] == undefined) {
                  this.featureLookup[latlng.attributes.index] = [];
                }
                this.featureLookup[latlng.attributes.index].push(layer);
              }
            })
          } else if (layer instanceof L.RunwayNode || layer instanceof L.ParkingSpot || layer instanceof L.HoldNode) {
            if( this.featureLookup[layer.glueindex] == undefined) {
              this.featureLookup[layer.glueindex] = [];
            }
            this.featureLookup[layer.glueindex].push(layer);
          } else {
            console.warn(layer)
          }          
        })
      },
      getPointCoords (index) {
        if(this.featureLookup[index]===undefined) {
          console.error("Lookup " + index + " failed ");          
          return;
        }
        return this.featureLookup[index].map((element, i) => {
          if (element instanceof L.Polyline) {
            var latLng = element._latlngs.map((e1, index1) => {
              console.log(e1);
              if (e1.attributes.index===index) {
                var latlng = {};
                latlng.lat =  e1.lat;
                latlng.lng =  e1.lng;
                return latlng;
              }
            }).filter(n => n);
            return latLng[0];
          } else if (element instanceof L.RunwayNode) {
            var latlng = {};
            latlng.lat =  element._latlng.lat;
            latlng.lng =  element._latlng.lng;
            return latlng;
          } else if (element instanceof L.ParkingSpot) {
            console.log(element);
            var latlng = {};
            latlng.lat =  element._latlng.lat;
            latlng.lng =  element._latlng.lng;
            return latlng;
          }
        }).filter(n => n);
      },
      /**
       * 
       */
      setPointCoords (index, coordinates) {
        var position = new Coordinates(coordinates);

        var latlng = {lat: position.latitude, lng: position.longitude };
        if(this.featureLookup[index]===undefined) {
          console.error("Lookup " + index + " failed ");          
          return;
        }
        return this.featureLookup[index].map((element, i) => {
          if (element instanceof L.RunwayNode) {
              element.setLatLng(latlng);
          }
          else if (element instanceof L.HoldNode) {
              element.setLatLng(latlng);
          }
          else if (element instanceof L.ParkingSpot) {
              // element.disableEdit();
              element.setLatLng(latlng);
              // element.enableEdit();
              // element.extensions();
              element.updateMiddleMarker();
              element.updateVertexFromDirection();
              element.updateWheelPos();
          }
          else if (element instanceof L.Polyline) {
              element._latlngs.forEach((e1, index1) => {
              if (e1.attributes.index===index && (
                    latlng.lat !== element.getLatLngs()[index1].lat ||  
                    latlng.lng !== element.getLatLngs()[index1].lng
                  )
                  ) {
                  element.getLatLngs()[index1].update(latlng);
                  element.setLatLngs(element.getLatLngs());
                  element.updateBeginVertex(latlng);
                  element.editor.refresh();
                  element.editor.reset();
                  element.updateMiddle();
              }
              })
          } else if (element instanceof L.Editable.VertexMarker) {
            /*
              console.log(element);
              element.setLatLng(latlng);
              element.latlngs.forEach((latlng1, index) => {
                  console.log(latlng1);
                  if (latlng1.__vertex === element) {
                      latlng1.update(latlng);
                  }
              });
              element.editor.feature.setLatLngs(element.latlngs);
              element.editor.feature.updateMiddle();
            */
          }    
        });
      },
      getParkings (){
        var parkings = []
        this.groundnetLayerGroup.eachLayer(l => {
          if (l instanceof L.ParkingSpot) {
            parkings.push(l)
          }
        })
        return parkings
      },
      refreshLookup(index) {
        //element.__vertex
          this.featureLookup[index] = this.featureLookup[index].filter(item => { 
            return !(item instanceof L.Editable.VertexMarker && item.editor.__vertex === undefined)
            }
            );
          this.featureLookup[index].forEach((element, i) => {
            if (element instanceof L.Polyline) {
              element.editor.refresh();
              element.editor.reset();
            }
          });
      },
      removeNode (index) {
        if(this.featureLookup[index]===undefined) {
          console.error("Lookup " + index + " failed ");          
          return;
        }
        try {
          this.featureLookup[index].forEach((element, i) => {
            if (element instanceof L.Polyline) {
              console.log('Poly : ' + i + ' ' + element.attributes);
              // Complete poly with be removed
              if ( element._latlngs.length <= 3 ) {
                if(Number(element.begin) !== index) {
                  this.featureLookup[Number(element.begin)] = this.featureLookup[Number(element.begin)].filter(item => item !== element);
                  this.refreshLookup(Number(element.begin))
                }
                if(Number(element.end) !== index) {
                  this.featureLookup[Number(element.end)] = this.featureLookup[Number(element.end)].filter(item => item !== element);
                  this.refreshLookup(Number(element.end))
                }
                element.removeFrom(this.groundnetLayerGroup);
              }
              else {
                element.getLatLngs().forEach((e1, index1) => {
                  console.log(index1 + ' ' + e1);
                  if (e1.attributes.index===index) {
                    var splitOffNodes = element.getLatLngs().splice(index1); 
                    element.editor.refresh();
                    element.editor.reset();
                    splitOffNodes.splice(0, 1);
                    if( splitOffNodes.length>1) {
                        var polyline = new L.Polyline(splitOffNodes, { attributes: {} }).addTo(layerGroup);
                        extendTaxiSegment(polyline);
                        polyline.addListeners();    
                        polyline.setEditlayer(this);
                        polyline.enableEdit();
                        polyline.editor.refresh();
                        polyline.editor.reset();
                        polyline.addTo(this.groundnetLayerGroup);                
                        polyline.end = element.end;
                        // Remove from end lookup
                        this.featureLookup[element.options.attributes.end] = this.featureLookup[element.options.attributes.end].filter(item => item !== element);
                        // push to the end lookup
                        this.featureLookup[element.options.attributes.end].push(polyline);                                                
                    }
                    if(element.getLatLngs().length === 1) {
                      this.featureLookup[index] = this.featureLookup[index].filter(item => item !== element);
                      element.removeFrom(this.groundnetLayerGroup);
                    }
                    // element.editor.splitShape(element._latlngs, index1);
                    console.log('Removed');
                  }
                });
              }
            } else if (element instanceof L.RunwayNode) {
              console.log('Runway : ' + i + ' ' + element.attributes);
              this.featureLookup[index] = this.featureLookup[index].filter(item => item !== element);
              element.removeFrom(this.groundnetLayerGroup);
            } else {
              console.warn('WTF' + element);
            }            
          });          
        } catch (error) {
            console.error(error);
        }
      },
      stopDrawing () {
        this.$parent.mapObject.editTools.stopDrawing()
      },
      drawPolyline () {
        var polyLine = this.$parent.mapObject.editTools.startPolyline()
        polyLine.addTo(this.groundnetLayerGroup)
        polyLine.groundnetLayerGroup = this.groundnetLayerGroup;
        polyLine.attributes = [];
        polyLine.featureLookup = this.featureLookup;
        extendTaxiSegment(polyLine);
        polyLine.setEditlayer(this);
        //polyLine.extensions(this);
        polyLine.addListeners()

        polyLine.on('editable:drawing:end', event => {
          console.log(event)
          event.target.addTo(this.groundnetLayerGroup)
        })
      },
      drawForwardPolyline () {
        var polyLine = this.$parent.mapObject.editTools.startPolyline()
        polyLine.addTo(this.groundnetLayerGroup)
        polyLine.groundnetLayerGroup = this.groundnetLayerGroup;
        polyLine.attributes = [];
        polyLine.options.attributes = {direction: 'forward' };
        polyLine.featureLookup = this.featureLookup;
        extendTaxiSegment(polyLine);
        polyLine.setEditlayer(this);
        //polyLine.extensions(this);
        polyLine.addListeners()

        polyLine.on('editable:drawing:end', event => {
          console.log(event)
          event.target.addTo(this.groundnetLayerGroup)
        })
      },      
      drawPushbackPolyline () {
        var polyLine = this.$parent.mapObject.editTools.startPolyline()
        polyLine.addTo(this.groundnetLayerGroup)
        polyLine.groundnetLayerGroup = this.groundnetLayerGroup;
        polyLine.attributes = [];
        polyLine.options.attributes = {isPushBackRoute: 1, direction: 'bi-directional' };
        polyLine.featureLookup = this.featureLookup;
        extendTaxiSegment(polyLine);
        polyLine.setEditlayer(this);
        polyLine.updateStyle();
        //polyLine.extensions(this);
        polyLine.addListeners()

        polyLine.on('editable:drawing:end', event => {
          console.log(event)
          event.target.addTo(this.groundnetLayerGroup)
          var pt = event.sourceTarget._latlngs[event.sourceTarget._latlngs.length-1];          
          pt.attributes.holdPointType = 'PushBack'
          var nIndex = pt.attributes.index
          var fa_icon = "<div style='background-color:#4838cc;' class='marker-pin'></div><i class='fas fa-arrows-alt-h'></i>";
          const icon = new L.DivIcon({
              className: 'custom-div-icon',
              html: fa_icon,
              iconSize: [30, 42],
              iconAnchor: [15, 42]
          });
          const node = new L.HoldNode(pt, { icon: icon });
          node.glueindex = nIndex;
          node.addTo(this.groundnetLayerGroup);
          node.featureLookup = this.featureLookup;
          this.featureLookup[nIndex].push(node);
          node.addListeners();
          node.extensions();
        })
      },
      editedParking() {
        if (this.$store.state.Editable.index === undefined ||
            this.$store.state.Editable.data.parking === undefined ||
            this.featureLookup===undefined) {
          return
        }
        console.log('Edited Parking : ' + this.$store.state.Editable.data.parking)
        //Notify list
        if (this.featureLookup[this.$store.state.Editable.index]===undefined) {
          return
        }
        this.featureLookup[this.$store.state.Editable.index].forEach((element,index) => {
          if (element instanceof L.ParkingSpot) {
            element.options.attributes = Object.assign({}, this.$store.state.Editable.data.parking)
            element.updateVertexFromDirection();     
            element.updateWheelPos();      
          }
        })
        if (this.$store.state.Editable.data.parking.coords) {
          this.setPointCoords(this.$store.state.Editable.index, this.$store.state.Editable.data.parking.coords)                    
        }
      },
      editedParkings() {
        if (this.featureLookup===undefined) {
          console.warn("Lookup undefinded");          
          this.buildLookup()
        }
        if (this.featureLookup===undefined) {
          return
        }
        console.log('Edited Parkings : ' + this.$store.state.Parkings.items)
        this.$store.state.Parkings.items.forEach( newElement => {
          console.debug(newElement);
          if(this.featureLookup[newElement.index]) {
            this.featureLookup[newElement.index].forEach((element,index) => {
              if (element instanceof L.ParkingSpot) {
                element.options.attributes.name = newElement.name
                element.options.attributes.number = newElement.number
                element.options.attributes.type = newElement.type
                //element.updateVertexFromDirection();           
              }
            })
          }
        })

/*
        this.$store.dispatch('updatedParking', this.$store.state.Editable.data.parking);
        this.featureLookup[this.$store.state.Editable.index].forEach((element,index) => {
          if (element instanceof L.ParkingSpot) {
            element.options.attributes = Object.assign({}, this.$store.state.Editable.data.parking)
            element.updateVertexFromDirection();           
          }
        })
*/        
      },
      editedArc() {
        if (!this.groundnetLayerGroup ||
            this.$store.state.Editable.index === undefined ||
            this.$store.state.Editable.data.arc === undefined ||
            this.featureLookup===undefined ||
            !this.editing) {
          return;
        }
        var arc = this.groundnetLayerGroup.getLayer(this.$store.state.Editable.index);
        if (arc && arc instanceof L.Polyline) {
          console.log('Edited Arc : ' + this.$store.state.Editable.index);
          arc.options.attributes = Object.assign({}, this.$store.state.Editable.data.arc)
          arc.updateStyle();
        }        
      },
      //Update Node
      editedNode() {
        if (this.$store.state.Editable.index === undefined ||
            this.$store.state.Editable.data.node === undefined ||
            this.featureLookup===undefined ||
            !this.editing) {
          return;
        }        
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
              element.removeFrom(this.groundnetLayerGroup);
              this.featureLookup[nIndex].splice(index,1);              
            }
            hasRunwayNode = true;
          } else if (element instanceof L.HoldNode) {
            if (!isHoldPoint) {
              // We shouldn't have a RunwayNode
              element.removeFrom(this.groundnetLayerGroup);
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
          else if (element instanceof L.Editable.VertexMarker) {
            latlng = element.latlng;
          }
          else if (element instanceof L.TaxiwaySegment) {
              if (Number(element.begin) === Number(nIndex)) {
                latlng = element._latlngs[0];
              }
              if (Number(element.end) === nIndex) {
                latlng = element._latlngs[1];
              }
          } else if (element instanceof L.Polyline) {
              element._latlngs.forEach(element => {                
                if(element.__vertex && Number(element.glueindex) === Number(nIndex)){                  
                  if (this.$store.state.Editable.data.node.coords) {
                    this.setPointCoords(this.$store.state.Editable.index, this.$store.state.Editable.data.node.coords)                    
                    var position = new Coordinates(this.$store.state.Editable.data.node.coords);
                    latlng = {lat: position.latitude, lng: position.longitude };
                  }
                }
              });
          }    
    
        })
        if (!hasRunwayNode && isOnRunway && latlng !== undefined) {
          this.$store.state.Editable.data.node.holdPointType
          const icon = new L.DivIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:#4838cc;' class='marker-pin'></div><i class='fas fa-plane-departure'></i>",
              iconSize: [30, 42],
              iconAnchor: [15, 42]
          });
          const node = new L.RunwayNode(latlng, { icon: icon });
          node.glueindex = nIndex;
          node.addTo(this.groundnetLayerGroup);
          this.featureLookup[nIndex].push(node);
          node.featureLookup = this.featureLookup;
          node.addListeners();
          node.extensions();
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
          node.addTo(this.groundnetLayerGroup);
          node.featureLookup = this.featureLookup;
          this.featureLookup[nIndex].push(node);
          node.addListeners();
          node.extensions();
        }
      },
      // Finde nearest node
      closestLayerSnap (eventLatlng, snap) {
        var layers = []
        this.groundnetLayerGroup.eachLayer((layer) => {
          if (layer instanceof L.Polyline) {
            // console.log(layer._latlngs)
            layer._latlngs.forEach(latlng => {
              if (latlng.__vertex) {
                if (Number.isNaN(latlng.glueindex)) {
                  console.warn('No glueindex : ' + latlng.__vertex);
                }
                let distance = latlng.distanceTo(eventLatlng)
                if (distance > 0 && distance < snap) {
                  layers.push({d: distance, l: layer, latlng: latlng.__vertex.latlng, glueindex: latlng.glueindex})
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
        this.$parent.mapObject._container.style.cursor = 'crosshair'
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
        const newIndex = (++this.groundnetLayerGroup.maxId)
        const circle = new L.ParkingSpot(event.latlng, {attributes: {index: newIndex, radius: 26, heading: 0}})
        circle.id = newIndex
        circle.glueindex = circle.id
        circle.addTo(this.groundnetLayerGroup)
        circle.featureLookup = this.featureLookup
        circle.enableEdit()
        circle.extensions()
        circle.addListeners()
        if (Number(this.$store.state.Editable.index) >= 0 &&
          this.featureLookup[this.$store.state.Editable.index]!==undefined) {
              this.featureLookup[this.$store.state.Editable.index].forEach(element => {
                  if(element.deselect !== undefined) {
                      element.deselect();
                  }
              });
        }
        this.$store.dispatch('setParking', circle.options.attributes);
        this.$store.dispatch('setParkingCoords', circle.getLatLng().lat.toFixed(5) + ' ' + circle.getLatLng().lng.toFixed(5));
        circle.select()
        addFeature(circle)
        // console.log(this.groundnetLayerGroup)
        this.$parent.mapObject.off('click', this.addParking)
        this.$parent.mapObject._container.style.cursor = ''
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
        this.load(this.icao, false)
      },
      //Copy to test directory
      test() {
        var f = path.join(this.$store.state.Settings.settings.airportsDirectory, this.icao[0], this.icao[1], this.icao[2], this.icao + '.groundnet.new.xml');
        var fNew = path.join(this.$store.state.Settings.settings.testDirectory, 'Airports', this.icao[0], this.icao[1], this.icao[2], this.icao + '.groundnet.xml');
        try { fs.mkdirSync(path.join(this.$store.state.Settings.settings.testDirectory, 'Airports'), { recursive: true })} catch (err) { }
        try { fs.mkdirSync(path.join(this.$store.state.Settings.settings.testDirectory, 'Airports', this.icao[0]),{ recursive: true })} catch (err) { }
        try { fs.mkdirSync(path.join(this.$store.state.Settings.settings.testDirectory, 'Airports', this.icao[0], this.icao[1]), { recursive: true })} catch (err) { }
        try { fs.mkdirSync(path.join(this.$store.state.Settings.settings.testDirectory, 'Airports', this.icao[0], this.icao[1], this.icao[2]), { recursive: true })} catch (err) { }

        fs.copyFileSync(f, fNew)
        this.$message({
          type: 'info',
          message: `Copied to ${fNew}`
        });
      },
      setVisible(visible) {
        if (this.layerGroup) {
          if (visible) {
            this.layerGroup.addTo(this.$parent.mapObject)
          } else {
            this.layerGroup.removeFrom(this.$parent.mapObject)
          }
        }

        if (this.groundnetLayerGroup === undefined) {
          return;
        }
        if (visible) {
          this.groundnetLayerGroup.addTo(this.$parent.mapObject)
        } else {
          this.groundnetLayerGroup.removeFrom(this.$parent.mapObject)
        }
      }
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
