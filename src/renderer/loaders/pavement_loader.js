/*
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
*/
/* eslint-disable */
const lineReader = require('readline');
const zlib = require('zlib');
// const geodesy = require('geodesy');
const LatLonEllipsoidal = require('geodesy/latlon-ellipsoidal-vincenty.js').default;
const fs = require('fs');

const store = require('../store');

const buildRunwayPoly = require('../leaflet/Runway.js');
const buildTaxiwayPoly = require('../leaflet/Taxiway.js');

/**
 * 
 * @param {*} line 
 * @param {*} icao 
 * @param {*} layerGroup 
 * @param {*} currentFeature 
 */

function bezier(line, icao, layerGroup, currentFeature) {
    var previous = currentFeature.slice(-1)[0].slice(-1)[0];
    if (previous !== undefined &&
        Number(previous[0]) !== Number(line[1]) &&
        Number(previous[1]) !== Number(line[2])) {

        var midpoint = calcMidpoint([Number(previous[0]), Number(previous[1])],
            [Number(line[1]), Number(line[2])]);

        var startPoint = [Number(previous[0]), Number(previous[1])];
        var endPoint = [Number(line[1]), Number(line[2])];

        if(module.exports.debug) {
          L.polyline([startPoint, endPoint], { color: 'fuchsia' }).addTo(layerGroup);
          var marker = new L.marker(endPoint, { title: 'endpoint', color: 'fuchsia' });
          marker.bindTooltip(String(currentFeature.slice(-1)[0].length + ' ' + line), { className: "my-label", offset: [0, 0] });
          marker.addTo(layerGroup);
}

        var control = [Number(line[3]), Number(line[4])];
        if (!isNaN(control[0]) && control[0] !== undefined && !isNaN(control[1]) && control[1] !== undefined) {

            var controlReflected = pointReflection([Number(line[3]), Number(line[4])],
                [Number(line[1]), Number(line[2])]);
            // L.marker(control, { title: 'control' }).addTo(layerGroup);

            // L.marker(controlPointReflected, { title: 'controlReflected' }).addTo(layerGroup);
            //            L.polyline([controlPointReflected, control], { color: 'green' }).addTo(layerGroup);

            //            L.polyline([controlReflected, control], { color: 'red' }).addTo(layerGroup);
            //            L.polyline([controlReflected, midpoint], { color: 'aqua' }).addTo(layerGroup);

            var modifiedControlPoint = calcMidpoint(controlReflected, midpoint);
            //            var modifiedControlPoint = controlReflected;

            var points = null;
            if (exports.bezierPoint === null) {

                if (module.exports.debug) {
                    L.polyline([startPoint, controlReflected, endPoint], { color: 'purple' }).addTo(layerGroup);

                    var marker = new L.marker(controlReflected, { title: 'control First' });
                    marker.bindTooltip(String(currentFeature.slice(-1)[0].length + ' ' + line), {className: "my-label", offset: [0, 0] });
                    marker.addTo(layerGroup);
                }
                points = deCasteljau([
                    [Number(previous[0]), Number(previous[1])],
                    controlReflected, [Number(line[1]), Number(line[2])]]);
                exports.bezierPoint = control;
            } else {
                if (module.exports.debug) {
                    L.polyline([startPoint, exports.bezierPoint, controlReflected, endPoint], { color: 'purple' }).addTo(layerGroup);
                    var marker = new L.marker(exports.bezierPoint, { title: 'exports.bezierPoint' }).addTo(layerGroup);
                    marker.bindTooltip(String(currentFeature.slice(-1)[0].length + ' ' + line), {className: "my-label", offset: [0, 10] });
                    marker.addTo(layerGroup);
                    
                    var marker1 = new L.marker(controlReflected, { title: 'controlReflected' }).addTo(layerGroup);
                    marker1.bindTooltip(String(currentFeature.slice(-1)[0].length + ' ' + line), {className: "my-label", offset: [0, -10] });
                    marker1.addTo(layerGroup);
                    
                }
                points = deCasteljau([
                    [Number(previous[0]), Number(previous[1])],
                    exports.bezierPoint,
                    controlReflected,
                    [Number(line[1]), Number(line[2])]]);
                exports.bezierPoint = control;
            }

            // L.polyline([previous, control, [Number(line[1]), Number(line[2])]]).addTo(layerGroup);
            for (let index = 0; index < points.length; index++) {
                const element = points[index];
                if (element[0] === "NaN") {
                    console.debug(control);
                }
                currentFeature.slice(-1)[0].push(element);
            }
        } else {
            var points = null;
            if (module.exports.debug) {
                L.polyline([startPoint, exports.bezierPoint, endPoint], { color: 'purple' }).addTo(layerGroup);
                L.marker(exports.bezierPoint, { title: 'exports.bezierPoint' }).addTo(layerGroup);
            }

            points = deCasteljau([
                [Number(previous[0]), Number(previous[1])],
                exports.bezierPoint,
                [Number(line[1]), Number(line[2])]]);

            for (let index = 0; index < points.length; index++) {
                const element = points[index];
                if (element[0] === "NaN") {
                    console.debug(control);
                }
                currentFeature.slice(-1)[0].push(element);
            }
        }
    }
    //L.marker([Number(line[3]), Number(line[4])]).addTo(layerGroup);

    currentFeature.slice(-1)[0].push([line[1], line[2]]);
    return currentFeature;
}

/**
* @brief Reflect point p on midpoint
*/
var pointReflectionMidpoint = function (p, p0, p1) {
    var dx, dy, a, b, x, y;

    dx = (p0[0] + p1[0]) / 2 - p[0];
    dy = (p0[1] + p1[1]) / 2 - p[1];

    return [(p0[0] + p1[0]) / 2 + dx, (p0[1] + p1[1]) / 2 + dy];
}

/**
* @brief Reflect point p on midpoint
*/
var pointReflection = function (p, p0) {
    var dx, dy;

    dx = p0[0] - p[0];
    dy = p0[1] - p[1];

    return [p0[0] + dx, p0[1] + dy];
}

/**
    * @brief Reflect point p along line through points p0 and p1
    *
    * @author Balint Morvai <balint@morvai.de>
    * @license http://en.wikipedia.org/wiki/MIT_License MIT License 
    * @param p point to reflect
    * @param p0 first point for reflection line
    * @param p1 second point for reflection line
    * @return object
    */
var reflect = function (p, p0, p1) {
    var dx, dy, a, b, x, y;

    dx = p1[0] - p0[0];
    dy = p1[1] - p0[1];
    a = (dx * dx - dy * dy) / (dx * dx + dy * dy);
    b = 2 * dx * dy / (dx * dx + dy * dy);
    x = a * (p[0] - p0[0]) + b * (p[1] - p0[1]) + p0[0];
    y = b * (p[0] - p0[0]) - a * (p[1] - p0[1]) + p0[1];

    return [x, y];
}

function calcMidpoint(p1, p2) {
    return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
}

function lerp(p1, p2, t) {
    const s = 1 - t;
    return [p1[0] * s + p2[0] * t, p1[1] * s + p2[1] * t];
}

function deCasteljau(p1, p2, control) {
    const numSegments = 10;
    var intermediates = [];

    for (let index = 0; index <= numSegments; index++) {
        p3 = lerp(p1, control, index / numSegments);
        p4 = lerp(control, p2, index / numSegments);
        var intermediate = lerp(p3, p4, index / numSegments);
        intermediates.push([String(intermediate[0]), String(intermediate[1])]);
    }
    intermediates.push(p2);
    return intermediates;
}

function deCasteljauSegment(pointArray, len) {
    var subPoints = [];
    if (pointArray.length == 1) {
        return pointArray[0];
    }
    for (let index = 1; index < pointArray.length; index++) {
        subPoints.push(lerp(pointArray[index - 1], pointArray[index], len));
    }
    return deCasteljauSegment(subPoints, len);
}


function deCasteljau(pointArray) {
    const numSegments = 10;
    var intermediates = [];

    for (let index = 0; index < numSegments; index++) {
        intermediates.push(deCasteljauSegment(pointArray, index / numSegments));
    }
    return intermediates;
}

function createPoly(currentFeature, layerGroup) {
    switch (module.exports.type) {
        case 110:
            var taxiwayPoly = new L.Polygon(currentFeature);
            taxiwayPoly.setStyle({ color: module.exports.colour, interactive: false });
            taxiwayPoly.addTo(layerGroup);
            break;
        case 120:
            var taxiwayPoly = new L.Polygon(currentFeature);
            taxiwayPoly.setStyle({ color: module.exports.colour, interactive: false });
            taxiwayPoly.addTo(layerGroup);
            break;
        case 130:
            var taxiwayPoly = new L.Polygon(currentFeature);
            taxiwayPoly.setStyle({ color: module.exports.colour, fillOpacity: .0, interactive: false });
            taxiwayPoly.addTo(layerGroup);
            break;
        default:
            break;
    }
}

function createLineString(currentFeature, layerGroup) {
    switch (module.exports.type) {
        case 110:
            var taxiwayPoly = new L.Polyline(currentFeature);
            taxiwayPoly.setStyle({ color: module.exports.colour, interactive: false });
            taxiwayPoly.addTo(layerGroup);
            break;
        case 120:
            var taxiwayPoly = new L.Polyline(currentFeature);
            taxiwayPoly.setStyle({ color: module.exports.colour, interactive: false });
            taxiwayPoly.addTo(layerGroup);
            break;
        case 130:
            var taxiwayPoly = new L.Polyline(currentFeature);
            taxiwayPoly.setStyle({ color: module.exports.colour, interactive: false });
            taxiwayPoly.addTo(layerGroup);
            break;
        default:
            break;
    }
}

module.exports.readPavement = function (f, icao, cb) {
    console.log(f);
    var pavementLayerGroup = L.layerGroup();
    var currentFeature;

    store.default.dispatch('setPavementLoaded', false);

    lineReader.createInterface({
        input: fs.createReadStream(f).pipe(zlib.createGunzip())
    }).on('line', function (line) {
        try {
            var fields = line.split(/[ ]+/);
            // var fields = line.match('([0-9]+)');
            if (fields == null)
                return;
            var scanMethod = scanMethods[fields[0]];
            if (scanMethod != null) {
                currentFeature = scanMethod(fields, icao, pavementLayerGroup, currentFeature);
            }
            else {
                if (fields[0] == '99') {
                    lineReader.close();
                }
                // console.log('Ignored:', line);
            }                
        } catch (error) {
            console.error('Error reading : ' + line + error);
        }
    }).on('error', function (err) {
        store.default.dispatch('setPavementLoaded', true);
        console.error(err);
        lr.close();
    }).on('close', function () {
        store.default.dispatch('setPavementLoaded', true);
        console.log("End");
        cb(pavementLayerGroup);
    });
}

module.exports.debug = false;
module.exports.isScanning = false;
module.exports.colour = 'grey';
module.exports.type = 0;
module.exports.bezierPoint = null;


var scanMethods = {
    1: (line, icao) => {
        // console.log('Airport:', line);
        if (line[4] === icao) {
            console.debug('Airport:', line);
            module.exports.isScanning = true;
        } else {
            module.exports.isScanning = false;
        }
    },
    // APTDAT 715 Segment
    10: (line, icao, layerGroup) => {
        if (module.exports.isScanning) {
          var pointMiddle = new LatLonEllipsoidal(Number(line[1]), Number(line[2]));
          var point1 = pointMiddle.destinationPoint(line[5]/6.562, line[4]);
          var point2 = pointMiddle.destinationPoint(line[5]/6.562, line[4]-180);

          var runwayPoints = [];

          var bearing = point1.initialBearingTo(point2);
          // Width in ft
          var runwayWidth = Number(line[8])/3.281;

          runwayPoints.push(point1.destinationPoint(runwayWidth / 2, (bearing + 90)));
          runwayPoints.push(point2.destinationPoint(runwayWidth / 2, (bearing + 90)));
          runwayPoints.push(point2.destinationPoint(runwayWidth / 2, (bearing - 90)));
          runwayPoints.push(point1.destinationPoint(runwayWidth / 2, (bearing - 90)));            

          var runwayPoly = buildTaxiwayPoly(runwayPoints);
          runwayPoly.addTo(layerGroup);
      }
    },
    // Runway
    100: (line, icao, layerGroup) => {
        if (module.exports.isScanning) {
            console.debug('Runway ', line);
            var point1 = new LatLonEllipsoidal(Number(line[9]), Number(line[10]));
            var point2 = new LatLonEllipsoidal(Number(line[18]), Number(line[19]));

            var runwayPoints = [];

            var bearing = point1.initialBearingTo(point2);
            var runwayWidth = Number(line[1]);
            var destination = point1.destinationPoint(1000, bearing);

            runwayPoints.push(point1.destinationPoint(runwayWidth / 2, (bearing + 90)));
            runwayPoints.push(point2.destinationPoint(runwayWidth / 2, (bearing + 90)));
            runwayPoints.push(point2.destinationPoint(runwayWidth / 2, (bearing - 90)));
            runwayPoints.push(point1.destinationPoint(runwayWidth / 2, (bearing - 90)));            

            var runwayPoly = buildRunwayPoly(runwayPoints);
            runwayPoly.addTo(layerGroup);
  
            var displacedEnd1 = point1.destinationPoint(Number(line[20]), bearing)
            var displacedEnd2 = point2.destinationPoint(Number(line[20]), bearing-180)

            var runwayLine = new L.Polyline([displacedEnd1, displacedEnd2]);
            runwayLine.setStyle({ color: 'yellow', stroke: true, dashArray: [50,50] });
            runwayLine.addTo(layerGroup);
            
            var t1 = new L.Polyline([displacedEnd1.destinationPoint(runwayWidth / 2, (bearing - 90)), 
                displacedEnd1.destinationPoint(runwayWidth / 2, (bearing + 90))]);
            t1.setStyle({ color: 'yellow' });
            t1.addTo(layerGroup);

            var t2 = new L.Polyline([displacedEnd2.destinationPoint(runwayWidth / 2, (bearing - 90)), 
                displacedEnd2.destinationPoint(runwayWidth / 2, (bearing + 90))]);
            t2.setStyle({ color: 'yellow' });
            t2.addTo(layerGroup);

            var runwayLine1 = new L.Polyline([point1, destination]);
            runwayLine1.setStyle({ color: 'red' });
            // runwayLine1.addTo(layerGroup);          
        }
    },
    // Pavement
    110: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
            return undefined;
        if (typeof currentFeature !== 'undefined') {
            createPoly(currentFeature, layerGroup);
        }
        module.exports.colour = 'grey';
        module.exports.type = 110;
        return [[]];
    },
    120: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
            return undefined;
        if (typeof currentFeature !== 'undefined') {
            createPoly(currentFeature, layerGroup);
        }
        module.exports.colour = 'yellow';
        module.exports.type = 120;
        return [[]];
    },
    130: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
            return undefined;
        if (typeof currentFeature !== 'undefined') {
            createPoly(currentFeature, layerGroup);
        }
        module.exports.colour = 'black';
        module.exports.type = 130;
        return [[]];
    },
    111: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
            return;
        console.debug(line);
        var previous = currentFeature.slice(-1)[0].slice(-1)[0];
        if (previous !== undefined &&
            previous !== null && 
            previous[0] === line[1] && 
            previous[1] === line[2]) {
            module.exports.bezierPoint = null;
        } else {
            currentFeature.slice(-1)[0].push([line[1], line[2]]);
            module.exports.bezierPoint = null;
        }
        return currentFeature;
    },
    // Bezier
    112: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning) {
            return;
        }
        console.debug(line);
        return bezier(line, icao, layerGroup, currentFeature);
    },
    113: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning) {
            return;
        }
        console.debug(line);
        currentFeature.slice(-1)[0].push([line[1], line[2]]);
        currentFeature.push([]);
        exports.bezierPoint = null;
        return currentFeature;
    },
    // Bezier
    114: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning) {
            return;
        }
        console.debug(line);
        bezier(line, icao, layerGroup, currentFeature);
        currentFeature.push([]);
        exports.bezierPoint = null;
        //        currentFeature.slice(-1)[0].push([line[1], line[2]]);
        return currentFeature;
    },
    115: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
            return;
        console.debug(line);
        if (exports.bezierPoint !== null) {
            bezier(line, icao, layerGroup, currentFeature);
        }
        else {
            currentFeature.slice(-1)[0].push([line[1], line[2]]);
        }
        createLineString(currentFeature, layerGroup);
        exports.bezierPoint = null;
    },
    // End with Bezier
    116: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
            return;
        console.debug(line);
        currentFeature = bezier(line, icao, layerGroup, currentFeature);
        createLineString(currentFeature, layerGroup);
        exports.bezierPoint = null;
        // taxiwayLine.addTo(layerGroup);      
    },
    99: (l) => {
        console.log('Finished');
    },
}



