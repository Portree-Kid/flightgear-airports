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
const store = require('../store');

/**http://wiki.openstreetmap.org/wiki/Zoom_levels*/


L.TowerMarker = L.Marker.extend({
    options: {
        zIndexOffset: 10000,
    },
    stripSVG: function(fName) {
        var rx = /<\s*svg[^>]*>([\s\S]*)<\s*\/svg[^>]*>/gm;
        var svg = fs.readFileSync(path.join(__static, '/', fName), 'utf8');
        var svg2 = rx.exec(svg);
        return svg2[0];
    },
    updateIcon : function(map) {
        console.debug(`Lat Lng Tower ${this.getLatLng()}`);
        if(map !== null) {
            var metersPP = this.metersPerPixel(map.getCenter().lat, map.getZoom());
            console.debug('Old Meters per pixel ' + this._metersPP);
            console.debug('New Meters per pixel ' + metersPP);
            if(this._metersPP != metersPP) {                
                var pixelSize = this.iconSize / metersPP;
                var scale = pixelSize/this.iconSize;
                var offset = 0;//-(this.iconSize/2);                
                this.setIcon(L.divIcon({
                    iconSize: 64,
                    className: 'threshold-marker-icon',
                    html: `<div style=\'transform: translateX(${offset}px) translateY(${offset}px) scale(${scale}); border: 1px red\'>${this.svg}</div>`,
                }));    

                this.update(this.getLatLng());
                console.debug();
                this.setLatLng(this.getLatLng());
                this._metersPP = metersPP;
            }
        }
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

L.TowerMarker.addInitHook(function(){
    this.svg = this.stripSVG('tower.svg');
    this.iconSize = 64;
    this.on('dragstart', function (event) { 
        console.debug("Drag Tower : ", event);
    });
    this.on('dragend', function (event) {
        console.debug("DragEnd Tower : ", event);
        store.default.dispatch('setTowerCoords', 
        event.target.getLatLng().lat.toFixed(6) + ' ' + 
        event.target.getLatLng().lng.toFixed(6) + ' ' + 
        event.target.elev_m);
    });
});

//Builds a marker for a ai or multiplayer aircraft
var tower = function (n, options) {    
    var latlon = convert(n.find('lat/text()').text() + " " + n.find('lon/text()').text());    
    var marker = new L.TowerMarker([latlon.decimalLatitude, latlon.decimalLongitude], {pane: 'tower-pane'}); 
    marker.elev_m = n.find('elev-m/text()').text(); 
    return marker;
}

module.exports = tower;
