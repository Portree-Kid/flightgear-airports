/*
Copyright 2021 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
*/

/* eslint-disable */

const turf = require('@turf/turf')

L.TakeoffPolygon = L.Polygon.extend({
    turfyRunway: [],

    setTurfy: function (padPoints) {
        var latLngs = padPoints.map(this.turfToLatLng);
        latLngs.push(latLngs[0]);
        this.turfyRunway = turf.polygon([latLngs]);
    },

    turfToLatLng: function (turfPoint) {
        return [turfPoint.lng, turfPoint.lat];
    }
});

var takeoffPadPoly = function (padPoints) {
    var takeoffPadPoly = new L.TakeoffPolygon(padPoints);
    takeoffPadPoly.setStyle({ color: 'black', fillColor: '', opacity: 1.0, fillOpacity: 0.0, interactive: false });
    takeoffPadPoly.setTurfy(padPoints);
    console.debug(padPoints);
    return takeoffPadPoly;
}



module.exports = takeoffPadPoly;