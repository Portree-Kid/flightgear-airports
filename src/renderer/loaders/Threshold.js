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
const turf = require('@turf/turf');


/**http://wiki.openstreetmap.org/wiki/Zoom_levels*/


L.Threshold = L.Marker.extend({
    heading: 0,
    displacement: 0,
    stopw_m: 0,
    originLatLng: null,
    rwy: '',
    interactive: false,
    stripSVG: function(fName) {
        var rx = /<\s*svg[^>]*>([\s\S]*)<\s*\/svg[^>]*>/gm;
        var svg = fs.readFileSync(path.join(__static, '/', fName), 'utf8');
        var svg2 = rx.exec(svg);
        return svg2[0];
    },
    updateIcon : function(map) {
        console.debug(`Lat Lng Threshold ${this.getLatLng()}`);
        if(map !== null) {
            var metersPP = this.metersPerPixel(map.getCenter().lat, map.getZoom());
            console.debug('Old Meters per pixel ' + this._metersPP);
            console.debug('New Meters per pixel ' + metersPP);
            if(this._metersPP != metersPP) {                
                var pixelSize = (this.iconSize/2) / metersPP;
                var scale = pixelSize/this.iconSize;
                var offset = 0;//-(this.iconSize/2);                
                this.setIcon(L.divIcon({
                    iconSize: 64,
                    className: 'threshold-marker-icon',
                    html: `<div style=\'transform: translateX(${offset}px) translateY(${offset}px) scale(${scale}) rotate(${this.heading}deg); border: 1px red\'>${this.svg}</div>`,
                }));    
                this.setInteractive(this.interactive);

                this.update(this.getLatLng());
                this.setLatLng(this.getLatLng());
                this._metersPP = metersPP;
            }
        }
    },
    setInteractive(interactive) {        
        if (interactive) {
            if(this._icon) {
              L.DomUtil.addClass(this._icon, 'leaflet-interactive');
            }
        } else {
            if(this._icon) {
                L.DomUtil.removeClass(this._icon, 'leaflet-interactive');
            }
        }
        this.interactive = interactive;
    },
    metersPerPixel: function (latitude, zoomLevel) {
        var earthCircumference = 40075017;
        var latitudeRadians = latitude * (Math.PI / 180);
        return earthCircumference * Math.cos(latitudeRadians) / Math.pow(2, zoomLevel + 8);
    },
    
    pixelValue: function (latitude, meters, zoomLevel) {
        return meters / metersPerPixel(latitude, zoomLevel);
    },
    setOrigin (originLatLng) {
        this.originLatLng = originLatLng;
    },
    setHeading (heading) {
        this.heading = Number(heading);
    },
    setRunway (rwy) {
        this.rwy = Number(rwy);
    },
    setStopW (stopw_m) {
        this.stopw_m = stopw_m;
    },
    setDisplacement(displacement) {
      const turfOptions = { units: 'kilometers' };
      this.displacement = Number(displacement);

      var newPos = turf.destination([this.originLatLng[1], this.originLatLng[0]], displacement/1000, this.normalizeAngle(this.heading), turfOptions);
      var newValue = {lat: newPos.geometry.coordinates[1].toFixed(6), 
                      lng: newPos.geometry.coordinates[0].toFixed(6) };
      console.debug(`Threshold Old : ${this.originLatLng} -> ${this.turfToLatLng(newPos)}`); 
      this.setLatLng(newValue);
    },
    normalizeAngle( angle ) {
        if(angle >= 180) {
            return angle - 360;
        }
        if(angle <= -180) {
          return angle + 360;
        }
        return angle;
    },
    latToTurf (turfPoint) {
        return [turfPoint.lng, turfPoint.lat];
    },
    latLngToTurf (turfPoint) {
        return [turfPoint.decimalLongitude, turfPoint.decimalLatitude];
    },
    turfToLatLng: function (turfPoint) {
        return '' + turfPoint.geometry.coordinates[1].toFixed(6) + ',' + turfPoint.geometry.coordinates[0].toFixed(6);
    }
});

L.Threshold.addInitHook(function(){
    this.svg = this.stripSVG('FGA_THR.svg');
    this.iconSize = 500;

    this.on('click', function (event) { 
        console.debug("Click Threshold : ", event);
        store.default.dispatch('setThreshold', {rwy: event.target.rwy, displacement: event.target.displacement});
    });
    this.on('add', function (event) {         
        event.target.setInteractive(false);
    });
});

//Builds a marker for a threshold 
/*              
<threshold>
  <lon>13.517142</lon>
  <lat>52.380125</lat>
  <rwy>07L</rwy>
  <hdg-deg>68.77</hdg-deg>
  <displ-m>0.0</displ-m>
  <stopw-m>160.0</stopw-m>
</threshold>
*/
var threshold = function (n, options) {
    var latlon = convert(n.find('lat/text()').text() + " " + n.find('lon/text()').text());
    var rwy = n.find('rwy/text()').text();
    var heading = n.find('hdg-deg/text()').text();
    var displ_m = n.find('displ-m/text()').text();
    var stopw_m = n.find('stopw-m/text()').text();

    var marker = new L.Threshold([latlon.decimalLatitude, latlon.decimalLongitude], 
        {pane: 'threshold-pane'});
    marker.setOrigin([latlon.decimalLatitude, latlon.decimalLongitude]);
    marker.setHeading(heading);    
    marker.setDisplacement(displ_m);    
    marker.setRunway(rwy);
    marker.setStopW(stopw_m);
    return marker;
}

module.exports = threshold;
