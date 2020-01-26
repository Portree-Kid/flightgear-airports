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
    taxiwaySegment.__proto__.extensions = function () {
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
    };
    taxiwaySegment.__proto__.addListeners = function () {
        this.on('click', function (event) {
            console.log("Click : " + event.target);
            store.default.dispatch('setArc', event.target.options.attributes);
        });
        this.on('editable:drawing:move', function (event) {
            console.log(event.target);
            if (dragIndex >= 0) {
                this.follow(dragIndex, event);
            }
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
                else if (element instanceof L.ParkingSpot) {
                    // element.disableEdit();
                    element.setLatLng(event.latlng);
                    // element.enableEdit();
                    // element.extensions();
                    element.updateMiddleMarker();
                    element.updateVertexFromDirection();
                }
                else if (element instanceof L.TaxiwaySegment) {
                    if (element.begin === dragIndex) {
                        element.getLatLngs()[0].update(event.latlng);
                        element.setLatLngs(element.getLatLngs());
                        element.updateBeginVertex(event.latlng);
                        element.updateMiddle();
                    }
                    if (element.end === dragIndex) {
                        element.getLatLngs()[element.getLatLngs().length - 1].update(event.latlng);
                        element.setLatLngs(element.getLatLngs());
                        element.updateEndVertex(event.latlng);
                        element.updateMiddle();
                    }
                }    
            }
        })
    };

    taxiwaySegment.__proto__.updateStyle = function() {
        var style = {};
        if (this.options.attributes.isPushBackRoute) {
          style.color = 'magenta';  
        }
        this.setStyle(style);
        if (!this.bidirectional) {
            this.setText('  ►  ', {repeat: true, attributes: {fill: 'red', size: 20}})
        }
    };
};
