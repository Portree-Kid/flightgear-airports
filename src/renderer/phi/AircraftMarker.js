/* eslint-disable */

const fs = require('fs');
const path = require('path');

/**http://wiki.openstreetmap.org/wiki/Zoom_levels*/

var metersPerPixel = function (latitude, zoomLevel) {
    var earthCircumference = 40075017;
    var latitudeRadians = latitude * (Math.PI / 180);
    return earthCircumference * Math.cos(latitudeRadians) / Math.pow(2, zoomLevel + 8);
};

var pixelValue = function (latitude, meters, zoomLevel) {
    return meters / metersPerPixel(latitude, zoomLevel);
};


function stripSVG(fName) {
    var rx = /<\s*svg[^>]*>([\s\S]*)<\s*\/svg[^>]*>/gm;
    var svg = fs.readFileSync(path.join(__static, '/', fName), 'utf8');
    var svg2 = rx.exec(svg);
    return svg2[0];
}

const airLinerSVG = stripSVG('Airplane_silhouette.svg');
const gaSVG = stripSVG('Black_aircraft_icon.svg');

L.AircraftMarker = L.Marker.extend({
    options: {
        zIndexOffset: 10000,
    },

    initialize: function (latlng, options) {
        L.Marker.prototype.initialize(latlng, options);
        L.Util.setOptions(this, options);
        this.heading = options.heading;        
        this.updateIcon();

        this.isDragging = false;

    },
    updateProperties: function(properties) {
        this.heading = properties.heading;
        this.updateIcon();
    },
    updateIcon : function() {
        if(this._map !== undefined && this._map !== null) {
            var metersPP = metersPerPixel(this._map.getCenter().lat, this._map.getZoom());
            console.log(metersPP);
            var scale = 0.07 / metersPP;
            this.setIcon(L.divIcon({
                iconSize: null,
                className: 'aircraft-marker-icon',
                html: `<div style=\'transform: translateX(-10px) translateY(-10px); height: 20px; width: 20px; border: 1px red\'>${airLinerSVG}</div>`,
            }));
            this.getElement().children.item(0).children.item(0).style = `transform: translateX(-200px) translateY(-200px) scale(${scale},${scale})  rotate(${(this.heading)-45}deg)`;
        }
        else {
            this.setIcon(L.divIcon({
                iconSize: null,
                className: 'aircraft-marker-icon',
                html: `<div style=\'transform: rotate(${this.heading}deg) scale(0.001,0.001) \'>${airLinerSVG}</div>`,
            }));    
        }
    },
    onAdd : function(map) {
        var metersPP = metersPerPixel(map.getCenter().lat, map.getZoom());
        console.log(metersPP);
        console.log(this);
        this.updateIcon();
    },

});

//Builds a marker for a ai or multiplayer aircraft
module.exports.default = function (latlng, options) {
    return new L.AircraftMarker(latlng, options);
}

/*
                      var l1 = feature.properties.callsign,
                          l2 = feature.properties.heading + 'T ' + feature.properties.speed + 'KTAS ' +
                               formatFL(feature.geometry.coordinates[2]),
                          l3 = feature.properties.departureAirportId + ' -> ' + feature.properties.arrivalAirportId;

*/