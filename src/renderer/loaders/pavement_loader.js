/* eslint-disable */
const lineReader = require('readline');
const zlib = require('zlib');
// const geodesy = require('geodesy');
const LatLonEllipsoidal = require( 'geodesy/latlon-ellipsoidal-vincenty.js').default;
const fs = require('fs');

function createPoly(currentFeature) {
    switch (module.exports.type) {
        case 110:
            var taxiwayPoly = new L.Polygon(currentFeature);
            taxiwayPoly.setStyle({color: module.exports.colour, interactive: false});
            taxiwayPoly.addTo(layerGroup);                                    
            break;            
        case 120:
            var taxiwayPoly = new L.Polygon(currentFeature);
            taxiwayPoly.setStyle({color: module.exports.colour, interactive: false});
            taxiwayPoly.addTo(layerGroup);                                    
            break;            
        case 130:
            var taxiwayPoly = new L.Polygon(currentFeature);
            taxiwayPoly.setStyle({color: module.exports.colour, fillOpacity: .0, interactive: false});
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
            taxiwayPoly.setStyle({color: module.exports.colour, interactive: false});
            taxiwayPoly.addTo(layerGroup);                                    
            break;            
        case 120:
            var taxiwayPoly = new L.Polyline(currentFeature);
            taxiwayPoly.setStyle({color: module.exports.colour, interactive: false});
            taxiwayPoly.addTo(layerGroup);                                    
            break;            
        case 130:
            var taxiwayPoly = new L.Polyline(currentFeature);
            taxiwayPoly.setStyle({color: module.exports.colour, interactive: false});
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

module.exports.isScanning = false;
module.exports.colour = 'grey';
module.exports.type = 0;


var scanMethods = {
    1: (line, icao) => {
        // console.log('Airport:', line);
        if (line[4]===icao){
            console.log('Airport:', line);
            module.exports.isScanning = true;
        } else {
            module.exports.isScanning = false;
        }
    },
    // Runway
    100: (line, icao, layerGroup) => {
        if (module.exports.isScanning) {
          console.log('Runway ', line );  
          var point1 = new LatLonEllipsoidal(Number(line[9]), Number(line[10]));
          var point2 = new LatLonEllipsoidal(Number(line[18]), Number(line[19]));

          var runwayPoints = [];

          var bearing = point1.initialBearingTo(point2);
          var runwayWidth = Number(line[1]);
          var destination = point1.destinationPoint( 1000, bearing);

          runwayPoints.push(point1.destinationPoint( runwayWidth/2, (bearing+90)));
          runwayPoints.push(point2.destinationPoint( runwayWidth/2, (bearing+90)));
          runwayPoints.push(point2.destinationPoint( runwayWidth/2, (bearing-90)));
          runwayPoints.push(point1.destinationPoint( runwayWidth/2, (bearing-90)));
          

          var runwayPoly = new L.Polygon(runwayPoints);
          runwayPoly.setStyle({color: 'grey', interactive: false});
          runwayPoly.addTo(layerGroup);

          var runwayLine = new L.Polyline([point1,point2]);
          runwayLine.setStyle({color: 'red'});
          // runwayLine.addTo(layerGroup);          
          
          var runwayLine1 = new L.Polyline([point1 ,destination]);
          runwayLine1.setStyle({color: 'red'});
          // runwayLine1.addTo(layerGroup);          
        }
    },
    // Pavement
    110: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
          return undefined;
        if(typeof currentFeature !== 'undefined')
        {
            createPoly(currentFeature);
        }
        module.exports.colour = 'grey';
        module.exports.type = 110;
        return [[]];
    },
    120: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
          return undefined;
        if(typeof currentFeature !== 'undefined')
        {
            createPoly(currentFeature);
        }
        module.exports.colour = 'yellow';
        module.exports.type = 120;
        return [[]];
    },
    130: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
          return undefined;
        if(typeof currentFeature !== 'undefined')
        {
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
        createLineString(currentFeature);
    },
    116: (line, icao, layerGroup, currentFeature) => {
        if (!module.exports.isScanning)
          return;
        currentFeature.slice(-1)[0].push([line[1], line[2]]);
        createLineString(currentFeature);
          // taxiwayLine.addTo(layerGroup);      
    },
    99: (l) => {
        console.log('Finished');
    }
}



