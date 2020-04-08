/* eslint-disable */
const lineReader = require('readline');
const zlib = require('zlib');
// const geodesy = require('geodesy');
const LatLonEllipsoidal = require('geodesy/latlon-ellipsoidal-vincenty.js').default;
const fs = require('fs');

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
                    console.log(control);
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
                    console.log(control);
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

function createPoly(currentFeature) {
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

function createLineString(currentFeature) {
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
    layerGroup = L.layerGroup();
    var currentFeature;

    lineReader.createInterface({
        input: fs.createReadStream(f).pipe(zlib.createGunzip())
    }).on('line', function (line) {
        var fields = line.split(/[ ]+/);
        // var fields = line.match('([0-9]+)');
        if (fields == null)
            return;
        var scanMethod = scanMethods[fields[0]];
        if (scanMethod != null) {
            currentFeature = scanMethod(fields, icao, layerGroup, currentFeature);
        }
        else {
            if (fields[0] == '99') {
                lineReader.close();
            }
            // console.log('Ignored:', line);
        }
    }).on('error', function (err) {
        console.log(err);
        lr.close();
    }).on('close', function () {
        console.log("End");
        cb(layerGroup);
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
            console.log('Airport:', line);
            module.exports.isScanning = true;
        } else {
            module.exports.isScanning = false;
        }
    },
    // Runway
    100: (line, icao, layerGroup) => {
        if (module.exports.isScanning) {
            console.log('Runway ', line);
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


            var runwayPoly = new L.Polygon(runwayPoints);
            runwayPoly.setStyle({ color: 'grey', interactive: false });
            runwayPoly.addTo(layerGroup);

            var runwayLine = new L.Polyline([point1, point2]);
            runwayLine.setStyle({ color: 'red' });
            // runwayLine.addTo(layerGroup);          

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
            createPoly(currentFeature);
        }
        module.exports.colour = 'grey';
        module.exports.type = 110;
        return [[]];
    },
    120: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
            return undefined;
        if (typeof currentFeature !== 'undefined') {
            createPoly(currentFeature);
        }
        module.exports.colour = 'yellow';
        module.exports.type = 120;
        return [[]];
    },
    130: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
            return undefined;
        if (typeof currentFeature !== 'undefined') {
            createPoly(currentFeature);
        }
        module.exports.colour = 'black';
        module.exports.type = 130;
        return [[]];
    },
    111: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
            return;
        console.log(line);
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
        console.log(line);
        return bezier(line, icao, layerGroup, currentFeature);
    },
    113: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning) {
            return;
        }
        console.log(line);
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
        console.log(line);
        bezier(line, icao, layerGroup, currentFeature);
        currentFeature.push([]);
        exports.bezierPoint = null;
        //        currentFeature.slice(-1)[0].push([line[1], line[2]]);
        return currentFeature;
    },
    115: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
            return;
        console.log(line);
        if (exports.bezierPoint !== null) {
            bezier(line, icao, layerGroup, currentFeature);
        }
        else {
            currentFeature.slice(-1)[0].push([line[1], line[2]]);
        }
        createLineString(currentFeature);
        exports.bezierPoint = null;
    },
    // End with Bezier
    116: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
            return;
        console.log(line);
        currentFeature = bezier(line, icao, layerGroup, currentFeature);
        createLineString(currentFeature);
        exports.bezierPoint = null;
        // taxiwayLine.addTo(layerGroup);      
    },
    99: (l) => {
        console.log('Finished');
    },
}



