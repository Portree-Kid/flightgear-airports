/* eslint-disable */
const fs = require('fs');
const path = require('path');
var xamel = require('xamel');
const convert = require('geo-coordinates-parser');

const store = require('../store');

const util = require('util');

const threshold = require('./Threshold.js');


var $ = require('jquery');

exports.readThresholdXML = function (fDir, icao, force) {
    try {
        var layerGroup = L.layerGroup();
        layerGroup.maxId = 0;
        var f = path.join(fDir, icao[0], icao[1], icao[2], icao + '.threshold.xml');
        var fNew = path.join(fDir, icao[0], icao[1], icao[2], icao + '.threshold.new.xml');

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

            var thresholdNodes = xml.find('PropertyList/runway/threshold');
            console.log("Threshold Nodes" + thresholdNodes.length);

            var merged = new Array();

            var nodesLookup = {};
            featureLookup = [];


            thresholdNodes.map(n => {
               var icon = threshold(n);
               icon.addTo(layerGroup);

                var latlon = convert(n.find('lat/text()').text() + " " + n.find('lon/text()').text());
                /*
                var marker = new L.Circle([latlon.decimalLatitude, latlon.decimalLongitude], 5);
                marker.addTo(layerGroup);
                */

//                features.push(circle);
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