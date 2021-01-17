/*
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
*/

/* eslint-disable */

const turf = require('@turf/turf')

L.RunwayPolygon = L.Polygon.extend({
    turfyRunway: [],

    setTurfy: function (runwayPoints) {
        var latLngs = runwayPoints.map(this.turfToLatLng);
        latLngs.push(latLngs[0]);
        this.turfyRunway = turf.polygon([latLngs]);        
    },

    turfToLatLng: function (turfPoint) {
        return [turfPoint.lng, turfPoint.lat];
    }    
});

var runwayPoly = function (runwayPoints) {
    var runwayPoly = new L.RunwayPolygon(runwayPoints);
    runwayPoly.setStyle({ color: 'grey', fillColor: 'grey', opacity: 0.5, fillOpacity: 0.5, interactive: false });
    runwayPoly.setTurfy(runwayPoints);
    console.debug(runwayPoints);
    return runwayPoly;
}



module.exports = runwayPoly;