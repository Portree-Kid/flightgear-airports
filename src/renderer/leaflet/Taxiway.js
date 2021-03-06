/*
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
*/

/* eslint-disable */

L.TaxiwayPolygon = L.Polygon.extend({
});

var taxiwayPoly = function (runwayPoints) {
    var taxiwayPoly = new L.TaxiwayPolygon(runwayPoints);
    taxiwayPoly.setStyle({ color: 'grey', fillColor: 'grey', opacity: 0.3, fillOpacity: 0.3, interactive: false });

    return taxiwayPoly;
}

module.exports = taxiwayPoly;