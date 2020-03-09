/* eslint-disable */
var L = require('leaflet');
const store = require('../store');

exports.extendTaxiSegment = function (taxiwaySegment) {
    taxiwaySegment.__proto__.begin;
    taxiwaySegment.__proto__.end;
    taxiwaySegment.__proto__.bidirectional;
    taxiwaySegment.__proto__.updateBeginVertex = function (latlng) {
        if (this._latlngs[0].__vertex) {
            this._latlngs[0].__vertex.setLatLng(latlng);            
        }
    };
    taxiwaySegment.__proto__.updateEndVertex = function (latlng) {
        if(this._latlngs[1].__vertex){
            this._latlngs[1].__vertex.setLatLng(latlng);        
        }
    };

    taxiwaySegment.__proto__.updateMiddle = function () {
        this._latlngs.forEach(element => {
            if(element.__vertex.middleMarker){
                element.__vertex.middleMarker.updateLatLng();
            }
        });
    };
    taxiwaySegment.__proto__.setEditlayer = function (editLayer) {
        this.editLayer = editLayer;
    };
    taxiwaySegment.__proto__.extensions = function (editLayer) {
        this.editLayer = editLayer;
        this._latlngs[0].__vertex.glueindex = this.begin;
        this._latlngs.slice(-1)[0].__vertex.glueindex = this.end;
        if (typeof this.featureLookup[this.begin] === 'undefined') {
            this.featureLookup[this.begin] = new Array();
        }
        if (typeof this.featureLookup[this.end] === 'undefined') {
            this.featureLookup[this.end] = new Array();
        }
        this.featureLookup[this.begin].push(this);
        this.featureLookup[this.end].push(this);
        this.bidirectional = true;
    };
    taxiwaySegment.__proto__.addListeners = function () {
        this.on('click', function (event) {
            event.target.setStyle({color : 'red'});
            console.log("Click : " + event.target);
            if (store.default.state.Editable.data.arc === undefined ||
                store.default.state.Editable.data.arc !== event.target.options.attributes) {
                if(event.target.options.attributes === undefined) {
                    event.target.options.attributes = {};  
                }
                event.target.options.attributes.index = event.target._leaflet_id;
                event.target.options.attributes.selected = true;
                store.default.dispatch('setArc', event.target.options.attributes);
            }
            this.unwatch = store.default.watch(
                function (state) {
                        return state.Editable.data.arc;
                },
                    () => { 
                        // Reset colour
                        if(event.target instanceof L.Polyline &&
                            event.target.options.attributes && 
                            event.target.options.attributes.selected) {
                            event.target.options.attributes.selected = false;
                            event.target.updateStyle();
                            this.unwatch();    
                        }
                    }                    
                ,
                {
                    deep: true //add this if u need to watch object properties change etc.

                }
            );
        });
        this.on('editable:drawing:move', function (event) {
            console.log(event.target);
            if (dragIndex >= 0) {
                this.follow(dragIndex, event);
            }
        });
        this.on('editable:vertex:new', event => {
            console.log(event)
            let closest = this.editLayer.closestLayerSnap(event.latlng, 10)
            if (closest) {
              event.latlng.__vertex['glueindex'] = Number(closest.glueindex);     
              event.latlng.__vertex.setLatLng(closest.latlng);
              this.editLayer.featureLookup[event.latlng.__vertex.glueindex].push(event.latlng.__vertex);
              event.latlng.attributes = {index: event.latlng.__vertex.glueindex, isOnRunway: 0};
              console.log(closest)
            } else {
              event.vertex['glueindex'] = ++this.editLayer.groundnetLayerGroup.maxId;
              event.vertex.latlng.attributes = {index: event.vertex.glueindex, isOnRunway: 0};
              this.editLayer.featureLookup[event.vertex.glueindex] = [];
              this.editLayer.featureLookup[event.vertex.glueindex].push(event.vertex);
              event.vertex.editor.enable();
            }
          });
        this.on('editable:vertex:deleted', event => {
            console.log(event)
        });
        this.on('editable:vertex:rawclick', event => {
            event.cancel()
            console.log(event)
        });
        this.on('editable:vertex:clicked', function (event) {
            console.log(this.featureLookup[event.vertex.glueindex]);            
            if (this.edit) {
                
            }

            store.default.dispatch('setNode', event.vertex.latlng.attributes)
            if(event.vertex._icon!=null) {
                event.vertex._icon.style['background-color'] = 'red';
            } else if(event.vertex.icon!=null ) {
                if(event.vertex.icon.style!=null) {
                    event.vertex.icon.style['background-color'] = 'red';
                } else {
                    event.vertex.setStyle({color : 'red'})
                }
            } else if(event.vertex.options.icon!=null ) {
                if(event.vertex.options.icon.style!=null) {
                    event.vertex.options.icon.style['background-color'] = 'red';
                } else {
                    event.vertex.options.icon._setIconStyles({color : 'red'})
                }
            } 
            this.unwatch = store.default.watch(
                function (state) {
                        return state.Editable.data.node;
                },
                    () => { 
                        if(event.vertex._icon!=null) {
                            event.vertex._icon.style['background-color'] = 'white';
                        } else if(event.vertex.icon!=null ) {
                            if(event.vertex.icon.style!=null) {
                                event.vertex.icon.style['background-color'] = 'white';
                            } else {
                                event.vertex.setStyle({color : 'white'})
                            }
                        } else if(event.vertex.options.icon!=null ) {
                            if(event.vertex.options.icon.style!=null) {
                                event.vertex.options.icon.style['background-color'] = 'white';
                            } else {
                                event.vertex.options.icon._setIconStyles({color : 'white'})
                            }
                        } 
                        this.unwatch();
                    }                    
                ,
                {
                    deep: true //add this if u need to watch object properties change etc.
                }
            );
        });
        var dragIndex = -1;
        this.on('editable:vertex:dragstart', function (event) {
            console.log("Event Target : ", event.target);            
            console.log("Middle Marker : ", event.vertex == event.vertex.middleMarker);            
            console.log("Middle Marker : ", event.vertex.glueindex == undefined);            
            if(event.vertex.glueindex == undefined)
              return;
            dragIndex = event.vertex.glueindex;
        });
        this.on('editable:vertex:dragend', function (event) {
            console.log("Dragend : ", event.vertex);
            if (dragIndex > 0) {
                this.featureLookup[dragIndex].forEach(element => {
                    if (element instanceof L.ParkingSpot) {
                        //element.setLatLng(event);
                        console.log(element);
                    }
                });
            }
            dragIndex = -1;
        });
    };
      /**
       * 
       */

      taxiwaySegment.__proto__.follow = function (dragIndex, event) {
        this.featureLookup[dragIndex].forEach(element => {
            if(element !== event.target){
                if (element instanceof L.RunwayNode) {
                    element.setLatLng(event.latlng);
                }
                else if (element instanceof L.HoldNode) {
                    element.setLatLng(event.latlng);
                }
                else if (element instanceof L.ParkingSpot) {
                    // element.disableEdit();
                    element.setLatLng(event.latlng);
                    // element.enableEdit();
                    // element.extensions();
                    element.updateMiddleMarker();
                    element.updateVertexFromDirection();
                }
                else if (element instanceof L.Polyline) {
                    if (Number(element.begin) === Number(dragIndex)) {
                        element.getLatLngs()[0].update(event.latlng);
                        element.setLatLngs(element.getLatLngs());
                        element.updateBeginVertex(event.latlng);
                        element.updateMiddle();
                    }
                    if (Number(element.end) === Number(dragIndex)) {
                        element.getLatLngs()[element.getLatLngs().length - 1].update(event.latlng);
                        element.setLatLngs(element.getLatLngs());
                        element.updateEndVertex(event.latlng);
                        element.updateMiddle();
                    }
                } else if (element instanceof L.Editable.VertexMarker) {
                    console.log(element);
                    element.setLatLng(event.latlng);
                    element.latlngs.forEach((latlng, index) => {
                        console.log(latlng);
                        if (latlng.__vertex === element) {
                            latlng.update(event.latlng);
                        }
                    });
                    element.editor.feature.setLatLngs(element.latlngs);
                    element.editor.feature.updateMiddle();
                }    
            }
        })
    };

    taxiwaySegment.__proto__.updateStyle = function() {
        var style = {};
        if(this.options.attributes.selected){
            style.color = 'red';  
        } else  if (this.options.attributes.isPushBackRoute) {
          style.color = 'magenta';  
        }
        else {
          style.color = '#3388ff';  
        }
        this.setStyle(style);
        if (this.options.attributes.direction === 'forward') {
            this.setText(null);
            this.setText('  ⮞  ', {repeat: true, attributes: {fill: 'red', size: 30}})
        } else if (this.options.attributes.direction === 'backward') {
            this.setText(null);
            this.setText('  ⮜  ', {repeat: true, attributes: {fill: 'red', size: 30}})
        }else {
            this.setText(null);
        }        
    };
};
