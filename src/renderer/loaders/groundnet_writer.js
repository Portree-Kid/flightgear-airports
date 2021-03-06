/* eslint-disable */
const fs = require('fs');
const path = require('path');

const markers = require('./MagneticVertex');

const parkingSpot = require('./ParkingSpot.js');

const store = require('../store');

const util = require('util');

const mathjs = require('mathjs');

var builder = require('xmlbuilder');

var featureLookup = [];
var parkings = [];
var pushBackNodeLookup = [];

/**
 * Walk nodes until the pushback node is found.
 * @param {*} index
 */

function findRouteToPushback (index) {
    if (featureLookup===undefined) {
      return
    }
    var walkedNodes = [index]
    var pushBackNodes = []
    walkPushbackRoute(index, walkedNodes, pushBackNodes)

    return pushBackNodes
  }

function walkPushbackRoute (index, walkedNodes, pushBackNodes) {
    var polyLines = featureLookup[index];
    if (polyLines===undefined) {
        return;
    }
    if (pushBackNodeLookup[index]!==undefined) {
        pushBackNodes.push(pushBackNodeLookup[index]['@index']);
    }

    polyLines.forEach(l => {
      if( l['@isPushBackRoute'] === '1' ) {
        if (Number(l['@begin']) === index && walkedNodes.indexOf(Number(l['@end'])) < 0) {
          walkedNodes.push(Number(l['@end']))
          pushBackNodes.concat(walkPushbackRoute(Number(l['@end']), walkedNodes, pushBackNodes))
        }
        if (Number(l['@end']) === index && walkedNodes.indexOf(Number(l['@begin'])) < 0 ) {
          walkedNodes.push(Number(l['@begin']))
          pushBackNodes.concat(walkPushbackRoute(Number(l['@begin']), walkedNodes, pushBackNodes))
        }
      }
    });
}

/**
 *
 * @param {*} fDir The directory
 * @param {*} icao
 * @param {*} featureList
 */

exports.writeGroundnetXML = function (fDir, icao, featureList) {
    try {
        try { fs.mkdirSync(path.join(fDir), { recursive: true })} catch (err) { }
        try { fs.mkdirSync(path.join(fDir, icao[0]),{ recursive: true })} catch (err) { }
        try { fs.mkdirSync(path.join(fDir, icao[0], icao[1]), { recursive: true })} catch (err) { }
        try { fs.mkdirSync(path.join(fDir, icao[0], icao[1], icao[2]), { recursive: true })} catch (err) { }

        var fileNames = [];
        for (let index = 1; index <= store.default.state.Settings.settings.numberOfSaves; index++) {
            fileNames.push(path.join(fDir, icao[0], icao[1], icao[2], icao + `.groundnet.bak.${index}.xml`));
        }
        var f = path.join(fDir, icao[0], icao[1], icao[2], icao + '.groundnet.new.xml');

        if( fs.existsSync(f) ) {
            var previous = '';
            fileNames.reverse().forEach(fBak => {
                if (fs.existsSync(fBak) && previous !== '') {
                    console.debug( `Copy ${fBak} to ${previous}`);
                    fs.copyFileSync(fBak, previous);
                }
                previous = fBak;
            });
            fs.copyFileSync(f, previous);
        }
        if (f == null)
            return;
        pushBackNodeLookup = [];

        console.debug(featureList);

        var parkings = featureList.map(mapParkings).filter(n => n);
        var runwayNodes = featureList.map(mapRunwayNodes).filter(n => n);
        var holdNodes = featureList.map(mapHoldPoint).filter(n => n);


        holdNodes.forEach(n => {
            pushBackNodeLookup[n['@index']] = n;
        });

        var nodes = [];
        var arcList = [];
        var frequencies = [];

        var version = new Date().toUTCString() + ' by FlightgearAirports ' + require('electron').remote.app.getVersion();
        var name = store.default.state.Settings.settings.name;

        featureLookup = [];
        // Loaded segments
        featureList.filter(o => o instanceof L.TaxiwaySegment).filter(n => n).forEach(element => {
            var begin = mapBeginNode(element);
            if(begin['@index']==="")
              console.warn("Begin missing");
            nodes[begin['@index']] = begin;
            var end = mapEndNode(element);
            if(end['@index']==="")
              console.warn("End missing");
            nodes[end['@index']] = end;
        });
        // New segments
        featureList.filter(o => o instanceof L.Polyline).filter(n => n).forEach(arcElement => {
            //            element._latlngs.forEach(latlng => { nodes[latlng.glueindex] = mapVertexNode(latlng) });
            var startIndex = -1;
            console.debug(arcElement.options.attributes);
            var currentArc = arcElement.options.attributes;
            arcElement._latlngs.forEach( latlng => {
                if (latlng !== undefined && latlng.glueindex !== undefined) {
                    nodes[latlng.glueindex] = mapVertexNode(latlng);
                    if (startIndex >= 0) {
                        if (featureLookup[startIndex] == undefined) {
                            featureLookup[startIndex] = [];
                        }
                        if (featureLookup[latlng.glueindex] == undefined) {
                            featureLookup[latlng.glueindex] = [];
                        }
                        if( currentArc.direction === 'bi-directional' || currentArc.direction === 'forward' ){
                            arc = { '@begin': startIndex, '@end': String(latlng.glueindex) };
                            styleArc(currentArc, arc);
                            arcList.push(arc);
                            featureLookup[startIndex][latlng.glueindex] = arc;
                        }
                        if( currentArc.direction === 'bi-directional' || currentArc.direction === 'backward' ){
                            arc = { '@begin': String(latlng.glueindex), '@end': startIndex };
                            styleArc(currentArc, arc);
                            arcList.push(arc);
                            featureLookup[latlng.glueindex][startIndex] = arc;
                        }
                        if (currentArc.direction === '' || !currentArc.direction) {
                            console.error( "Arc without direction " + util.inspect(currentArc) );
                        }
                    }
                    startIndex = latlng.glueindex;
                } else {
                    console.error( "LatLng without glueindex " + util.inspect(latlng) );
                }
            });
        });
        runwayNodes.forEach(element => {
            if (nodes[element['@index']] != undefined) {
                nodes[element['@index']]['@isOnRunway'] = "1";
            }
        });


        // Find the index of the pushback node
        parkings.forEach(n => {
            nodes[n['@index']] = null;
            var pushBackNode = findRouteToPushback(Number(n['@index']))[0];
            if (pushBackNode!==undefined) {
              n['@pushBackRoute'] = pushBackNode;
            }
        });
        nodes = nodes.filter(n => n);

        arcList = arcList.filter(a => a['@begin'] !== a['@end']);

        nodes.sort((p, p2) => { return p['@index'] - p2['@index'] });
        //console.debug(util.inspect(nodes));
        var uniqueNodes = nodes.filter((v, i, a) => a.indexOf(v) === i);

        var approachList = store.default.state.Frequencies.items.filter(f => f.type === 'APPROACH').map(mapFrequency);

        var awosList = store.default.state.Frequencies.items.filter(f => f.type === 'AWOS').map(mapFrequency);

        var clearanceList = store.default.state.Frequencies.items.filter(f => f.type === 'CLEARANCE').map(mapFrequency);

        var departureList = store.default.state.Frequencies.items.filter(f => f.type === 'DEPARTURE').map(mapFrequency);

        var groundList = store.default.state.Frequencies.items.filter(f => f.type === 'GROUND').map(mapFrequency);

        var towerList = store.default.state.Frequencies.items.filter(f => f.type === 'TOWER').map(mapFrequency);

        var unicomList = store.default.state.Frequencies.items.filter(f => f.type === 'UNICOM').map(mapFrequency);


        var gapStart = -1;
        var gapEnd = -1;

        do {
            gapStart = -1;
            gapEnd = -1;
            var allIds = parkings.map(n => Number(n['@index']))
            .concat(uniqueNodes.map(n => Number(n['@index'])))
            .sort((a, b) => a - b);

            allIds.forEach((element, index, array)  => {
                if (index > 0 && array[index-1] + 1 != element && gapStart == -1 ) {
                    gapStart = array[index-1];
                    gapEnd = element;
                }
            });
            var gap = gapEnd - gapStart -1;
            if ( gap >= 0 ) {
                parkings = parkings.map(n => {
                    if (n['@index']>gapStart) {
                        n['@index'] = String(n['@index'] - gap);
                    }
                    if (n['@pushbackRoute']>gapStart) {
                        n['@pushbackRoute'] = String(n['@pushbackRoute'] - gap);
                    }
                    return n;
                 });
                uniqueNodes = uniqueNodes.map(n => {
                    if (n['@index']>gapStart) {
                        n['@index'] = String(n['@index'] - gap);
                    }
                    return n;
                 });
                arcList = arcList.map(n => {
                    if (n['@begin']>gapStart) {
                        n['@begin'] = String(n['@begin'] - gap);
                    }
                    if (n['@end']>gapStart) {
                        n['@end'] = String(n['@end'] - gap);
                    }
                    return n;
                 });
            }

        } while( gapStart > 0 && gapEnd > 0);

        var xmlObj = { groundnet: { version: 1, fgaversion: version, name: name,
            'frequencies': { APPROACH: approachList, DEPARTURE: departureList, AWOS: awosList, CLEARANCE: clearanceList, GROUND: groundList, TOWER: towerList, UNICOM: unicomList },
            parkingList: { Parking: parkings }, TaxiNodes: { node: uniqueNodes }, TaxiWaySegments: { arc: arcList } } };

        xmlString = builder.create(xmlObj).end({ pretty: true });
        fs.writeFileSync(f, xmlString);
        console.debug(xmlString);
    } catch (error) {
        console.error(error);
    }
    return;
}

var mapFrequency = function (o) {
    return mathjs.round(o.value, 0);
}

var mapParkings = function (o) {
    console.debug(o);
    if (o instanceof L.ParkingSpot) {
        var lat = convertLat(o.getLatLng());
        var lon = convertLon(o.getLatLng());
        // <Parking index="0" type="gate" name="GA_Parking" lat="S9 25.739923" lon="E160 2.927602" heading="67"  radius="44" airlineCodes="" />
        var parking = { '@index': String(o['id']), '@type': o.options.attributes.type, '@lat': lat, '@lon': lon, '@heading': Number(o.options.attributes.heading%360).toFixed(1), '@radius': String(o.options.attributes.radius) };
        if (o.options.attributes.name !== '' && o.options.attributes.name !== 'undefined' && o.options.attributes.name !== undefined) {
            parking['@name'] = o.options.attributes.name;
        }
        if( o.options.attributes.airlineCodes) {
            console.debug(o.options.attributes.airlineCodes);
            parking['@airlineCodes'] = o.options.attributes.airlineCodes;
        }
        if(o.options.attributes.number !== undefined &&
            typeof o.options.attributes.number === 'number' || (
                typeof o.options.attributes.number === 'string' &&
                o.options.attributes.number.trim() !== ''
            )
            ) {
            console.debug(o.options.attributes.number);
            parking['@number'] = o.options.attributes.number;
        }

        return parking;
    }
}

var mapRunwayNodes = function (o) {
    console.debug(o);
    if (o instanceof L.RunwayNode) {
        var runwayNode = { '@index': String(o['glueindex']),
        '@lat': convertLat(o._latlng),
        '@lon': convertLon(o._latlng),
        '@isOnRunway': '1',
        '@holdPointType': 'none' };
        return runwayNode;
    }
    if (o instanceof L.HoldNode) {
        // return { '@index': String(o['glueindex']), '@lat': convertLat(o._latlng), '@lon': convertLon(o._latlng), '@isOnRunway': '0', '@holdPointType': o['holdPointType'] };
    }
}

var mapHoldPoint = function (o) {
    if (o instanceof L.HoldNode) {
        if( o['holdPointType'] === undefined )
        {
            console.error('Oh dear ' + o);
        }
        return { '@index': String(o['glueindex']), '@holdPointType': o['holdPointType'] };
    }
}

var mapBeginNode = function (o) {
    if (o instanceof L.TaxiwaySegment) {
        console.debug('Map Begin : ', o['begin']);
        // <Parking index="0" type="gate" name="GA_Parking" lat="S9 25.739923" lon="E160 2.927602" heading="67"  radius="44" airlineCodes="" />
        return { '@index': String(o['begin']), '@lat': convertLat(o._latlngs[0]), '@lon': convertLon(o._latlngs[0]), '@isOnRunway': '0', '@type': 'begin' };
    }
}

var mapEndNode = function (o) {
    if (o instanceof L.TaxiwaySegment) {
        console.debug('Map End : ', o['end']);
        // <Parking index="0" type="gate" name="GA_Parking" lat="S9 25.739923" lon="E160 2.927602" heading="67"  radius="44" airlineCodes="" />
        return { '@index': String(o['end']), '@lat': convertLat(o._latlngs[1]), '@lon': convertLon(o._latlngs[1]), '@isOnRunway': '0', '@type': 'end' };
    }
}

var mapVertexNode = function (l) {
    if (l instanceof L.LatLng) {
        console.debug(l);
        // <Parking index="0" type="gate" name="GA_Parking" lat="S9 25.739923" lon="E160 2.927602" heading="67"  radius="44" airlineCodes="" />
        return { '@index': String(l.glueindex), '@lat': convertLat(l), '@lon': convertLon(l), '@isOnRunway': '0', '@holdPointType': l.attributes['holdPointType'] };
    }
}

var convertLat = function (latlng) {
    //console.debug(latlng.lat);
    var NS = latlng.lat > 0 ? 'N' : 'S';
    var deg = mathjs.floor(mathjs.abs(latlng.lat));
    var min = (mathjs.abs(latlng.lat) - deg) * 60;
    // console.debug(NS + deg + " " + min);
    return NS + String(deg).padStart(2, '0') + " " + mathjs.round(min, 6);
}

var convertLon = function (latlng) {
    //console.debug(latlng.lng);
    var NS = latlng.lng > 0 ? 'E' : 'W';
    var deg = mathjs.floor(mathjs.abs(latlng.lng));
    var min = (mathjs.abs(latlng.lng) - deg) * 60;
    // console.debug(NS + deg + " " + min);
    return NS + String(deg).padStart(2, '0') + " " + mathjs.round(min, 6);
}

var styleArc = function (attributes, arc) {
    //console.debug(attributes);
    if(attributes !== undefined){
        if (attributes.isPushBackRoute !== undefined && Number(attributes.isPushBackRoute) === 1 ) {
            arc['@isPushBackRoute'] = "1";
        } else {
            arc['@isPushBackRoute'] = "0";
        }
        if ( attributes.name !== '' && attributes.name !== 'undefined') {
            arc['@name'] = attributes.name;
        }
    }
}