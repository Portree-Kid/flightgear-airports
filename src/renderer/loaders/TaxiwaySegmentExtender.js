/* eslint-disable */
const Vue = require('vue');

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
        if (this._latlngs[1].__vertex) {
            this._latlngs[1].__vertex.setLatLng(latlng);
        }
    };

    taxiwaySegment.__proto__.updateMiddle = function () {
        this._latlngs.forEach(element => {
            if (element.__vertex && element.__vertex.middleMarker) {
                element.__vertex.middleMarker.updateLatLng();
            }
        });
    };
    taxiwaySegment.__proto__.setEditlayer = function (editLayer) {
        this.editLayer = editLayer;
    };
    taxiwaySegment.__proto__.extensions = function (editLayer) {
        this.editLayer = editLayer;
        this._latlngs[0].glueindex = this.begin;
        this._latlngs.slice(-1)[0].glueindex = this.end;
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
    taxiwaySegment.__proto__.select = function () {
        this.options.attributes.selected = true;
        this.updateStyle();
    };
    taxiwaySegment.__proto__.selectVertex = function () {
        this.getLatLngs().forEach( element => {
            if (Number(element.glueindex) === store.default.state.Editable.index) {                
        if (element.__vertex._icon != null) {
            element.__vertex.__proto__.deselect = function () {
                if (this._icon != null) {
                    this._icon.style.setProperty('background-color','white');                    
                    this._icon.style.setProperty('color','white');                    
                } else if (this.icon != null) {
                    if (this.icon.style != null) {
                        this.icon.style['background-color'] = 'white';
                    } else {
                        this.setStyle({ color: 'white' })
                    }
                } else if (this.options.icon != null) {
                    if (this.options.icon.style != null) {
                        this.options.icon.style['background-color'] = 'white';
                    } else {
                        this.options.icon._setIconStyles({ color: 'white' })
                    }
                }                        
            }
            element.__vertex._icon.style.setProperty('background-color','red');                    
            element.__vertex._icon.style.setProperty('color','red');                    
        } else if (element.__vertex !== undefined && element.__vertex.icon != null) {
            if (element.__vertex.icon.style != null) {
                element.__vertex.icon.style['background-color'] = 'red';
            } else {
                element.__vertex.setStyle({ color: 'red' })
            }
        } else if (element.__vertex.options.icon != null) {
            if (element.__vertex.options.icon.style != null) {
                element.__vertex.options.icon.style['background-color'] = 'red';
            } else {
                element.__vertex.options.icon._setIconStyles({ color: 'red' })
            }
        }    
          }
       });                    
    };
    taxiwaySegment.__proto__.deselect = function () {
        this.options.attributes.selected = false;
        this.updateStyle();
        this.getLatLngs().forEach( element => {
            if (element.__vertex!==undefined) {
                if (element.__vertex._icon != null) {
                    element.__vertex._icon.style['background-color'] = 'white';
                } else if (element.__vertex.icon != null) {
                    if (element.__vertex.icon.style != null) {
                        element.__vertex.icon.style['background-color'] = 'white';
                    } else {
                        element.__vertex.setStyle({ color: 'white' })
                    }
                } else if (element.__vertex.options.icon != null) {
                    if (element.__vertex.options.icon.style != null) {
                        element.__vertex.options.icon.style['background-color'] = 'white';
                    } else {
                        element.__vertex.options.icon._setIconStyles({ color: 'white' })
                    }
                }                        
            }
        });
    };
    taxiwaySegment.__proto__.addListeners = function () {
        this.on('click', function (event) {
            if (Number(store.default.state.Editable.index) >= 0 && 
            this.featureLookup[store.default.state.Editable.index] !== undefined) {
                this.featureLookup[store.default.state.Editable.index].forEach(element => {
                    element.deselect();
                });
            }
            event.target.select();
            console.log("Click : " + event.target);
            if (store.default.state.Editable.data.arc === undefined ||
                store.default.state.Editable.data.arc !== event.target.options.attributes) {
                if (event.target.options.attributes === undefined) {
                    event.target.options.attributes = {};
                }
                event.target.options.attributes.index = event.target._leaflet_id;

                this.editLayer.featureLookup[event.target._leaflet_id] = [];
                this.featureLookup[event.target._leaflet_id].push(this);
                event.target.options.attributes.selected = true;
                store.default.dispatch('setArc', event.target.options.attributes);
            }
        });
        this.on('editable:drawing:move', function (event) {
            if (dragIndex >= 0) {
                console.log('GlueDrag : '+ dragIndex + '\t' + event.target.dragIndex);
                this.follow(dragIndex, event);
            }
        });
        this.on('editable:vertex:new', event => {
            console.log(event)
            // Find nearest node
            let closest = this.editLayer.closestLayerSnap(event.latlng, 5)
            let taxiwaySegment = event.latlng.__vertex.editor.feature;
            if (taxiwaySegment.options.attributes === undefined) {
                taxiwaySegment.options.attributes = { direction: 'bi-directional' };
            }
            taxiwaySegment.updateStyle();
            // Glue to another node
            if (closest) {
                event.latlng['glueindex'] = Number(closest.glueindex);
                event.latlng.__vertex.setLatLng(closest.latlng);
                event.latlng.attributes = { index: event.latlng.glueindex, isOnRunway: 0 };
                // Push Vertex to lookup
                this.editLayer.featureLookup[event.latlng.glueindex].push(event.latlng.__vertex);
                if (taxiwaySegment.options.attributes.begin === undefined) {
                    taxiwaySegment.options.attributes.begin = event.latlng['glueindex']
                } else {
                    taxiwaySegment.options.attributes.end = event.latlng['glueindex']
                }
                if (taxiwaySegment.getLatLngs().length === 1) {
                    taxiwaySegment.begin = closest.glueindex;
                }
                taxiwaySegment.end = closest.glueindex;
                console.log(`Closest : ${closest}`)
            } else {
                event.vertex.latlng['glueindex'] = ++this.editLayer.groundnetLayerGroup.maxId;
                event.vertex.latlng.attributes = { index: event.vertex.latlng.glueindex, isOnRunway: 0 };
                this.editLayer.featureLookup[event.vertex.latlng.glueindex] = [];
                this.editLayer.featureLookup[event.vertex.latlng.glueindex].push(event.vertex);
                this.editLayer.featureLookup[event.vertex.latlng.glueindex].push(taxiwaySegment);
                // taxiwaySegment.editor.refresh();
                //taxiwaySegment.editor.reset();
                if (taxiwaySegment.options.attributes.begin === undefined) {
                    taxiwaySegment.options.attributes.begin = event.vertex.latlng['glueindex']
                    taxiwaySegment.begin = event.vertex.latlng.glueindex;
                } else if (taxiwaySegment.options.attributes.end === undefined ||
                    (taxiwaySegment.getLatLngs()[taxiwaySegment.getLatLngs().length - 1].glueindex &&
                        Number(taxiwaySegment.getLatLngs()[taxiwaySegment.getLatLngs().length - 1].glueindex) !== taxiwaySegment.options.attributes.end)) {
                    taxiwaySegment.options.attributes.end = event.vertex.latlng['glueindex']
                    taxiwaySegment.end = Number(event.vertex.latlng.glueindex);
                }
            }
        });
        this.on('editable:vertex:deleted', event => {
            console.log('editable:vertex:deleted' + event)
        });
        this.on('editable:vertex:rawclick', event => {
            event.cancel()
            console.log(event)
        });
        this.on('editable:vertex:clicked', function (event) {
            if (Number(store.default.state.Editable.index) >= 0 &&
                this.featureLookup[store.default.state.Editable.index] !== undefined) {
                this.featureLookup[store.default.state.Editable.index].forEach(element => {
                    if(element.deselect !== undefined) {
                        element.deselect();
                    }
                });
            }
            if (!this.editor.map.editTools.drawing()) {
                var hold = this.featureLookup[event.vertex.latlng.glueindex].filter(n => n instanceof L.HoldNode);
                if (hold.length > 0) {
                    hold[0].select();
                }
                var parking = this.featureLookup[event.vertex.latlng.glueindex].filter(n => n instanceof L.ParkingSpot);
                if (parking.length > 0) {
                    parking[0].selectParking();
                } else {
                    this.editLayer.featureLookup[event.vertex.latlng.glueindex].forEach
                    store.default.dispatch('setNode', event.vertex.latlng)
                    this.selectVertex()
                }                    
            }
        });
        var dragIndex = -1;
        this.on('editable:vertex:dragstart', function (event) {
            console.log("Drag Start : ", event.target);
            console.log("Middle Marker : ", event.vertex == event.vertex.middleMarker, event.vertex.latlng.glueindex == undefined);
            if (event.vertex.latlng.glueindex == undefined)
                return;
            console.log("Drag Start : ", event.vertex.latlng.glueindex);
            dragIndex = event.vertex.latlng.glueindex;
        });
        this.on('editable:vertex:dragend', function (event) {
            console.log("Dragend : ", event.vertex);
            if (dragIndex > 0) {
                event.target.featureLookup[dragIndex].forEach(element => {
                    if (element instanceof L.ParkingSpot) {
                        //element.setLatLng(event);
                        console.log(element);
                    }
                });
            }
            dragIndex = -1;
            var parking = this.featureLookup[event.vertex.latlng.glueindex].filter(n => n instanceof L.ParkingSpot);
            if (parking.length > 0) {
                parking[0].selectParking();
            } else {
                if( Number(event.vertex.latlng.glueindex) !== store.default.state.Editable.index) {
                    if (Number(store.default.state.Editable.index) >= 0 &&
                      this.featureLookup[store.default.state.Editable.index] !== undefined) {
                      this.featureLookup[store.default.state.Editable.index].forEach(element => {
                            if(element.deselect !== undefined) {
                                element.deselect();
                            }
                        });
                      }
                      store.default.dispatch('setNode', event.vertex.latlng)
                }
                var lines = this.featureLookup[event.vertex.latlng.glueindex].filter(n => n instanceof L.Polyline);
                Vue.default.nextTick(function () {
                    lines.forEach( line => {
                        line.selectVertex()
                    });
                })
            }

        });
    };
    /**
     * 
     */

    taxiwaySegment.__proto__.follow = function (dragIndex, event) {
        this.featureLookup[dragIndex].forEach(element => {
            if (element !== event.target) {
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
                    element.updateWheelPos();
                    element.updateBox();
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
                } else if (element instanceof L.Editable.VertexMarker &&
                    element !== event.vertex) {
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

    taxiwaySegment.__proto__.updateStyle = function () {
        var style = {};
        if (this.options.attributes.selected) {
            style.color = 'red';
        } else if (this.options.attributes.isPushBackRoute) {
            style.color = 'magenta';
        }
        else {
            style.color = '#3388ff';
        }
        this.setStyle(style);
        if(this._map !== null) {
            if (this.options.attributes.direction === 'forward') {
                this.setText(null);
                this.setText('  ⮞  ', { repeat: true, attributes: { fill: 'red', size: 30 } })
            } else if (this.options.attributes.direction === 'backward') {
                this.setText(null);
                this.setText('  ⮜  ', { repeat: true, attributes: { fill: 'red', size: 30 } })
            } else {
                this.setText(null);
            }
    
        }       
    };
};
