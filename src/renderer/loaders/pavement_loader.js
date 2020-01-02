/* eslint-disable */
const lineReader = require('readline');
const zlib = require('zlib');
const turf = require('@turf/turf');
const fs = require('fs');

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

module.exports.isScanning = false;


var scanMethods = {
    1: (line, icao) => {
        console.log('Airport:', line);
        if (line[4]===icao){
            module.exports.isScanning = true;
        } else {
            module.exports.isScanning = false;
        }
    },
    // Runway
    100: (line, icao, layerGroup) => {
        if (module.exports.isScanning) {
          console.log('Runway ', line );  
          var point1 = turf.point([line[9], line[10]]);
          var point2 = turf.point([line[18], line[19]]);

          var runwayPoints = [];

          var bearing = turf.bearing(point1, point2);
          var runwayEnd1 = [line[9], line[10]];
          var runwayEnd2 = [line[18], line[19]];
          var runwayWidth = Number(line[1])/1000;
          var destination = turf.destination(point1, runwayWidth/2, bearing, {});

          runwayPoints.push(turf.destination(point1, runwayWidth/2, bearing+90, {}));
          runwayPoints.push(turf.destination(point2, runwayWidth/2, bearing+90, {}));
          runwayPoints.push(turf.destination(point2, runwayWidth/2, bearing-90, {}));
          runwayPoints.push(turf.destination(point1, runwayWidth/2, bearing-90, {}));
          
          runwayPoints = runwayPoints.map(p => p.geometry.coordinates);

          var runwayPoly = new L.Polygon(runwayPoints);
          runwayPoly.setStyle({color: 'grey'});
          runwayPoly.addTo(layerGroup);

          console.log(turf.bearing(point1, point2), turf.bearing(point2, point1));
          console.log(runwayEnd1, runwayEnd2);


          // var end = turf.destination([start.lat, start.lng], this.attributes.radius / 1000, this.attributes.heading - 180, options);
          
        }
    },
    // Pavement
    110: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
          return undefined;
        if(typeof currentFeature !== 'undefined')
        {
          var taxiwayPoly = new L.Polygon(currentFeature);
          taxiwayPoly.setStyle({color: 'grey'});
          taxiwayPoly.addTo(layerGroup);      
        }
        return [[]];
    },
    120: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
          return undefined;
        return [[]];
    },
    130: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
          return undefined;
        return [[]];
    },
    111: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
          return;
        console.log(line);
        currentFeature.slice(-1)[0].push([line[1], line[2]]);
        return currentFeature;
    },
    112: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
          return;
        console.log(line);
        currentFeature.slice(-1)[0].push([line[1], line[2]]);
        return currentFeature;
    },
    113: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
          return;
        currentFeature.slice(-1)[0].push([line[1], line[2]]);
        currentFeature.push([]);
        return currentFeature;
    },
    114: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
          return;
        currentFeature.slice(-1)[0].push([line[1], line[2]]);
        currentFeature.push([]);
        return currentFeature;
    },
    115: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
          return;
          currentFeature.slice(-1)[0].push([line[1], line[2]]);
        var taxiwayLine = new L.Polyline(currentFeature);
        taxiwayLine.setStyle({color: 'red'});
        // taxiwayLine.addTo(layerGroup);      
    },
    116: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
          return;
          currentFeature.slice(-1)[0].push([line[1], line[2]]);
        var taxiwayLine = new L.Polyline(currentFeature);
        taxiwayLine.setStyle({color: 'red'});
        // taxiwayLine.addTo(layerGroup);      
    },
    99: (l) => {
        console.log('Finished');
    }
}



