/* eslint-disable */
const convert = require('geo-coordinates-parser');
const leaflet = require('leaflet');
const turf = require('@turf/turf');
const util = require('util');
const store = require('../store');

var $ = require('jquery');
L.RunwayNode = L.Marker.extend({
    addListeners: function () {
        this.on('editable:drawing:move', function (event) {
            console.log("Move : ", event);
            // Is it the edit vertex (Middle) moving?
            this.follow(event.target.glueindex, event);
        });
        this.on('click', function (event) {
            console.log("Click Runway : ", event);
            if (Number(store.default.state.Editable.index) >= 0 &&
            this.featureLookup[store.default.state.Editable.index]!==undefined) {
                this.featureLookup[store.default.state.Editable.index].forEach(element => {
                    element.deselect();
                });
            }
            event.target.options.attributes.selected = true;
            if (store.default.state.Editable.index !== event.target.options.attributes.index) {
                store.default.dispatch('setRunway', event.target.options.attributes);
            }
        });
    },
    select() {
        try {
            this._icon.style['color'] = 'red';            
        } catch (error) {
            console.error(error);
        }
    },    
    deselect() {
        try {
            this._icon.style['color'] = 'black';            
        } catch (error) {
            console.error(error);
        }
    },    
    extensions: function (editLayer) {
        this.options.attributes = {};
        if (typeof this.featureLookup[this.glueindex] === 'undefined') {
            this.featureLookup[this.glueindex] = new Array();
        }
        this.featureLookup[this.glueindex].push(this);
    },
    /**
     * 
     */

    follow(dragIndex, event) {
        this.featureLookup[dragIndex].forEach(element => {
            if (element !== event.target) {
                if (element instanceof L.HoldNode) {
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
                        if(latlng.__vertex === element) {
                          latlng.update(event.latlng);
                        }
                    });
                    element.editor.feature.setLatLngs(element.latlngs);
                    element.editor.feature.updateMiddle();
                }    
            }
        })
    }
});

var runwayNode = function (n, layerGroup) {
    var latlon = convert(n.attr('lat') + " " + n.attr('lon'));
    const icon = new L.DivIcon({
        className: 'custom-div-icon',
        html: "<div style='background-color:#4838cc;' class='marker-pin'></div><i class='fas fa-plane-departure'></i>",
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });
    var node = new L.RunwayNode([latlon.decimalLatitude, latlon.decimalLongitude], { icon: icon, attributes: {} });
    node.glueindex = n.attr('index');
    $.each( n.attrs, function( key, value ) {        
        if(isNaN(value))
          node.options.attributes[ key ] = value;
        else
        node.options.attributes[ key ] = Number( value);
    });

    node.addTo(layerGroup);
    node.addListeners();
    return node;
}

module.exports = runwayNode;