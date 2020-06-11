/* eslint-disable */
const convert = require('geo-coordinates-parser');
const leaflet = require('leaflet');
const turf = require('@turf/turf');
const util = require('util');
const store = require('../store');

var $ = require('jquery');
L.HoldNode = L.Marker.extend({
    select() {
        this._icon.childNodes[0].style['background-color'] = 'red';
    },    
    deselect() {
        this._icon.childNodes[0].style['background-color'] = '#4838cc';
    },
    addListeners: function () {
        this.on('editable:drawing:move', function (event) {
            console.log("Move : ", event);
            // Is it the edit vertex (Middle) moving?
            this.follow(event.target.glueindex, event);
        });
    },
    extensions: function (editLayer) {
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

var holdNode = function (n, layerGroup) {
    //console.log(n.attr('lat') + " " + n.attr('lon'));
    var latlon = convert(n.attr('lat') + " " + n.attr('lon'));    
    var fa_icon = null;
    if (n.attr('holdPointType') === 'PushBack') {
        fa_icon = "<div style='background-color:#4838cc;' class='marker-pin'></div><i class='fas fa-arrows-alt-h'></i>";
    } else if (n.attr('holdPointType') === 'normal') {
        fa_icon = "<div style='background-color:#4838cc;' class='marker-pin'></div><i class='fas fa-hand-paper'></i>";
    }
    const icon = new L.DivIcon({
        className: 'custom-div-icon',
        html: fa_icon,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });
    const node = new L.HoldNode([latlon.decimalLatitude, latlon.decimalLongitude], { icon: icon });
    node.glueindex = n.attr('index');
    node.holdPointType = n.attr('holdPointType');
    node.addTo(layerGroup);
    node.addListeners();
    return node;
}

module.exports = holdNode;