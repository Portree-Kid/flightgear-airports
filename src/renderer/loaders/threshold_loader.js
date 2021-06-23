/* eslint-disable */
const fs = require('fs');
const path = require('path');
const xamel = require('xamel');
const convert = require('geo-coordinates-parser');
const LatLonEllipsoidal = require('geodesy/latlon-ellipsoidal-vincenty.js').default;

const store = require('../store');

const util = require('util');

const takeoffPadPoly = require('../leaflet/TakeoffPad.js');

const threshold = require('./Threshold.js');


var $ = require('jquery');

exports.readThresholdXML = function (fDir, icao, force, stripes) {
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

            var runwayNodes = xml.find('PropertyList/runway');
            console.log("Threshold Nodes" + runwayNodes.length);

            featureLookup = [];

            var index = 0;
            runwayNodes.map(r => {
                var thresholds = r.find('threshold');
                thresholds.map(n => {
                    var icon = threshold(n);
                    icon.index = index;
                    icon.addTo(layerGroup);
                    // Width in m
                    var runwayWidth = 20;
                    var latlon = convert(n.find('lat/text()').text() + " " + n.find('lon/text()').text());
                    var displ_m = Number(n.find('displ-m/text()').text());
                    var pointMiddle = new LatLonEllipsoidal(latlon.decimalLatitude, latlon.decimalLongitude);
                    var heading = Number(n.find('hdg-deg/text()').text());
                    var point1 = pointMiddle.destinationPoint(displ_m, heading);
                    var point2 = pointMiddle.destinationPoint(displ_m + 80, heading);

                    var runwayPoints = [];
                    runwayPoints.push(point1.destinationPoint(runwayWidth / 2, (heading + 90)));
                    runwayPoints.push(point2.destinationPoint(runwayWidth / 2, (heading + 90)));
                    runwayPoints.push(point2.destinationPoint(runwayWidth / 2, (heading - 90)));
                    runwayPoints.push(point1.destinationPoint(runwayWidth / 2, (heading - 90)));

                    var runwayPoly = takeoffPadPoly(runwayPoints);
                    runwayPoly.addTo(layerGroup);
                }
                )

                index+=1;
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
