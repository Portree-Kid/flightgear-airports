/*
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
*/
/* eslint-disable */
const fs = require('fs');
const path = require('path');
var xamel = require('xamel');
const convert = require('geo-coordinates-parser');

const store = require('../store');

const util = require('util');

const tower = require('./Tower.js');


var $ = require('jquery');

exports.readTowerXML = function (fDir, icao, force) {
    try {
        var layerGroup = L.layerGroup();
        layerGroup.maxId = 0;
        var f = path.join(fDir, icao[0], icao[1], icao[2], icao + '.twr.xml');
        var fNew = path.join(fDir, icao[0], icao[1], icao[2], icao + '.twr.new.xml');

        if (f == null || !fs.existsSync(f))
            return;
        if (fNew != null && fs.existsSync(fNew) && !force) {
            f = fNew;
        }

        var features = new Array();

        //        map.on("editable:vertex:new", function (event) {
        //            log.console("Add vertex " + event);
        //        });

        var xmlGroundnet = fs.readFileSync(f, 'utf8').toString();
        xamel.parse(xmlGroundnet, function (err, xml) {
            console.debug("parsed " + path.basename(f));
            if (err !== null) {
                console.error("Error in " + airline);
                throw err;
            }

            var towerNodes = xml.find('PropertyList/tower/twr');
            console.log("Tower " + towerNodes.length);

            var merged = new Array();

            var nodesLookup = {};
            featureLookup = [];


            towerNodes.map(n => {
                var towerIcon = tower(n, layerGroup);
                towerIcon.addTo(layerGroup);
                var latlon = convert(n.find('lat/text()').text() + " " + n.find('lon/text()').text());
                /*
                var marker = new L.Circle([latlon.decimalLatitude, latlon.decimalLongitude], 5);
                marker.addTo(layerGroup);
                */

                features.push(towerIcon);
            }).sort();

            return layerGroup;
        });
        //                  var jsonAirports = JSON.parse(geoJSON);
        //        return jsonAirports;
    } catch (error) {
        console.error(error);
    }
    return layerGroup;
};