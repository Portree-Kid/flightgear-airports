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
            follow(event.target.id, event);
        });
    }
});

var runwayNode = function (n, layerGroup) {
    //console.log(n.attr('lat') + " " + n.attr('lon'));
    var latlon = convert(n.attr('lat') + " " + n.attr('lon'));
    //console.log(latlon.decimalLatitude);
    //console.log(convert(n.attr('lat') + " " + n.attr('lon')).decimalLongitude);
    const icon = new L.DivIcon({
        className: 'custom-div-icon',
        html: "<div style='background-color:#4838cc;' class='marker-pin'></div><i class='fas fa-plane-departure'></i>",
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });
    const node = new L.RunwayNode([latlon.decimalLatitude, latlon.decimalLongitude], { icon: icon });
    node.glueindex = n.attr('index');
    node.addTo(layerGroup);
    node.addListeners();
    return node;
}

module.exports = runwayNode;