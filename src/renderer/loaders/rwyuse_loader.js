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

exports.writeRwyUseXML = function (fDir, icao, runways) {
    try {
            var fNew = path.join(fDir, icao[0], icao[1], icao[2], icao + '.rwyuse.new.xml');
            var fileContent = '<?xml version="1.0" encoding="UTF-8"?>\n';            
            var takeoffRunways = runways.join(', ');
            var landingRunways = runways.join(', ');
/**
<?xml version="1.0"?>
<rwyuse> <!-- Times are in UTC -->
  <com>  <!-- Commercial Traffic Day-->
    <wind tail="7" cross="20" />
    <time start="00:00" end="24:00" schedule="day" />
  </com>
  <com>   <!-- Commercial Traffic Night-->
    <wind tail="7" cross="20" />
    <time start="00:00" end="24:00" schedule="night" />
  </com>
  <gen>    <!-- General Aviation Day-->
    <wind tail="7" cross="20" />
    <time start="00:00" end="24:00" schedule="day" />
  </gen> 
    <gen>    <!-- General Aviation Night-->
    <wind tail="7" cross="20" />
    <time start="00:00" end="24:00" schedule="night" />
  </gen> 
  <!-- commercial schedule -->
  <schedule name="night">
	<takeoff> 23,  05, 15L, 33R</takeoff>
    <takeoff>24R, 06L, 15L, 33R</takeoff>
    <landing>24L, 06R, 15R, 33L</landing>
  </schedule>
  <schedule name="day">
	<takeoff> 23,  05, 15L, 33R</takeoff>
    <takeoff>24R, 06L, 15L, 33R</takeoff>
    <landing>24L, 06R, 15R, 33L</landing>
  </schedule>
  <!-- general schedule -->
  <schedule name="night">
	<takeoff> 23,  05, 15L, 33R</takeoff>
    <takeoff>24R, 06L, 15L, 33R</takeoff>
    <landing>24L, 06R, 15R, 33L</landing>
  </schedule>
  <schedule name="day">
	<takeoff> 23,  05, 15L, 33R</takeoff>
    <takeoff>24R, 06L, 15L, 33R</takeoff>
    <landing>24L, 06R, 15R, 33L</landing>
  </schedule>
</rwyuse>
**/
            fileContent += '<rwyuse> <!-- Times are in UTC -->\n';
            fileContent += '  <com>  <!-- Commercial Traffic Day-->\n';
            fileContent += '    <wind tail="7" cross="20" />\n';
            fileContent += '    <time start="00:00" end="24:00" schedule="day" />\n';
            fileContent += '  </com>\n';
            fileContent += '  <com>   <!-- Commercial Traffic Night-->\n';
            fileContent += '    <wind tail="7" cross="20" />\n';
            fileContent += '    <time start="00:00" end="24:00" schedule="night" />\n';
            fileContent += '  </com>\n';
            fileContent += '  <gen>    <!-- General Aviation Day-->\n';
            fileContent += '    <wind tail="7" cross="20" />\n';
            fileContent += '    <time start="00:00" end="24:00" schedule="day" />\n';
            fileContent += '  </gen>\n';
            fileContent += '    <gen>    <!-- General Aviation Night-->\n';
            fileContent += '    <wind tail="7" cross="20" />\n';
            fileContent += '    <time start="00:00" end="24:00" schedule="night" />\n';
            fileContent += '  </gen>\n';
            fileContent += '  <!-- commercial schedule -->\n';
            fileContent += '  <schedule name="night">\n';
            fileContent += `	<takeoff>${takeoffRunways}</takeoff>\n`;
            fileContent += `    <landing>${landingRunways}</landing>\n`;
            fileContent += '  </schedule>\n';
            fileContent += '  <schedule name="day">\n';
            fileContent += `	<takeoff>${takeoffRunways}</takeoff>\n`;
            fileContent += `    <landing>${landingRunways}</landing>\n`;
            fileContent += '  </schedule>\n';
            fileContent += '  <!-- general schedule -->\n';
            fileContent += '  <schedule name="night">\n';
            fileContent += `	<takeoff>${takeoffRunways}</takeoff>\n`;
            fileContent += `    <landing>${landingRunways}</landing>\n`;
            fileContent += '  </schedule>\n';
            fileContent += '  <schedule name="day">\n';
            fileContent += `	<takeoff>${takeoffRunways}</takeoff>\n`;
            fileContent += `    <landing>${landingRunways}</landing>\n`;
            fileContent += '  </schedule>\n';
            fileContent += '</rwyuse>\n';
            fs.writeFileSync(fNew, fileContent, 'utf8');
     } catch (error) {  console.error(error); }
};

exports.readRwyUseXML = function (fDir, icao, force, stripes) {
    store.default.dispatch('setRwyUseLoaded', false);
    try {
        var layerGroup = L.layerGroup();
        layerGroup.maxId = 0;
        var f = path.join(fDir, icao[0], icao[1], icao[2], icao + '.rwyuse.xml');
        var fNew = path.join(fDir, icao[0], icao[1], icao[2], icao + '.rwyuse.new.xml');

        if (f == null || !fs.existsSync(f))
            return;
        if (fNew != null && fs.existsSync(fNew) && !force) {
            f = fNew;
        }

        var features = new Array();

        //        map.on("editable:vertex:new", function (event) {
        //            log.console("Add vertex " + event);
        //        });

        var xmlRwyUse = fs.readFileSync(f, 'utf8').toString();
        xamel.parse(xmlRwyUse, function (err, xml) {
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
    store.default.dispatch('setRwyUseLoaded', true);
    return layerGroup;
};
