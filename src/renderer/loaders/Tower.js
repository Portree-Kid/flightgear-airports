/*
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
*/
/* eslint-disable */

const convert = require('geo-coordinates-parser');
const fs = require('fs');
const path = require('path');

/**http://wiki.openstreetmap.org/wiki/Zoom_levels*/


L.TowerMarker = L.Marker.extend({
    options: {
        zIndexOffset: 10000,
    },

    initialize: function (latlng, options) {
        L.Marker.prototype.initialize(latlng, options);
        L.Util.setOptions(this, options);
        this.svg = this.stripSVG('tower.svg');

        this.isDragging = false;        
    },
    updateProperties: function(properties) {
        this.heading = properties.heading;
        this.updateIcon();
    },
    stripSVG: function(fName) {
        var rx = /<\s*svg[^>]*>([\s\S]*)<\s*\/svg[^>]*>/gm;
        var svg = fs.readFileSync(path.join(__static, '/', fName), 'utf8');
        var svg2 = rx.exec(svg);
        return svg2[0];
    },
    updateIcon : function(map) {
        if(map !== null) {
            var metersPP = this.metersPerPixel(map.getCenter().lat, map.getZoom());
            if(this._metersPP != metersPP) {
                console.debug('Meters per pixel ' + metersPP);
                var pixelSize = 32 / metersPP;
                var scale = pixelSize/64;
                var offset = -(64/2);
                this.setIcon(L.divIcon({
                    iconSize: 64,
                    className: 'tower-marker-icon',
                    html: `<div style=\'transform: translateX(${offset}px) translateY(${offset}px) scale(${scale}); border: 1px red\'>${this.svg}</div>`,
                }));    
                this._metersPP = metersPP;
            }
        }
    },
    onAdd : function(map) {
        var metersPP = this.metersPerPixel(map.getCenter().lat, map.getZoom());
        console.debug('Meters per pixel ' + metersPP);
        this.updateIcon(map);
    },
    metersPerPixel: function (latitude, zoomLevel) {
        var earthCircumference = 40075017;
        var latitudeRadians = latitude * (Math.PI / 180);
        return earthCircumference * Math.cos(latitudeRadians) / Math.pow(2, zoomLevel + 8);
    },
    
    pixelValue: function (latitude, meters, zoomLevel) {
        return meters / metersPerPixel(latitude, zoomLevel);
    },
        

});

//Builds a marker for a ai or multiplayer aircraft
var tower = function (n, options) {
    var latlon = convert(n.find('lat/text()').text() + " " + n.find('lon/text()').text());
    return new L.TowerMarker([latlon.decimalLatitude, latlon.decimalLongitude], options);
}

module.exports = tower;
