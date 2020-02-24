/* eslint-disable */
var L = require('leaflet');
const store = require('../store');


L.TaxiwaySegment = L.Polyline.extend({
    begin: String,
    end: String,
    bidirectional: Boolean,

    updateBeginVertex: function (latlng) {
        if (this._latlngs[0].__vertex) {
            this._latlngs[0].__vertex.setLatLng(latlng);
        }
    },
    updateEndVertex: function (latlng) {
        if (this._latlngs[1].__vertex) {
            this._latlngs[1].__vertex.setLatLng(latlng);
        }
    },

    updateMiddle: function () {
        this._latlngs.forEach(element => {
            if (element.__vertex.middleMarker) {
                element.__vertex.middleMarker.updateLatLng();
            }
        });
    },
    extensions: function (editLayer) {
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
    },
    addListeners: function () {
        this.on('click', function (event) {
            console.log("Click : " + event.target);
            store.default.dispatch('setArc', event.target.options.attributes);
            store.default.watch( function (state) {
                return state.Editable.data.arc;
            },
            () => { 
                console.log(this) 
            }
            ,
            {
              deep: true //add this if u need to watch object properties change etc.
            });
        });
        this.on('editable:drawing:move', function (event) {
            console.log(event.target);
            if (dragIndex >= 0) {
                this.follow(dragIndex, event);
            }
        });
        this.on('editable:vertex:clicked', function (event) {
            console.log(this.featureLookup[event.vertex.glueindex]);

            store.default.dispatch('setNode', event.vertex.latlng.attributes)
            event.vertex._icon.style['background-color'] = 'red';
        });
        var dragIndex = -1;
        this.on('editable:vertex:dragstart', function (event) {
            console.log("Event Target : ", event.target);
            console.log("Middle Marker : ", event.vertex == event.vertex.middleMarker);
            console.log("Middle Marker : ", event.vertex.glueindex == undefined);
            if (event.vertex.glueindex == undefined)
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
    },
    /**
     * 
     */

    follow(dragIndex, event) {
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
    },

    updateStyle() {
        var style = {};
        if (this.options.attributes.isPushBackRoute) {
            style.color = 'magenta';
        }
        console.log("isPushBackRoute ", this.options.attributes.isPushBackRoute);
        this.setStyle(style);
        if (!this.bidirectional) {
            this.setText('  ►  ', { repeat: true, attributes: { fill: 'red', size: 20 } })
        }
    }
});