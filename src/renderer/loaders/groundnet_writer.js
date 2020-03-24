/* eslint-disable */
const fs = require('fs');
const path = require('path');

const markers = require('./MagneticVertex');
const TaxiwaySegment = require('./TaxiwaySegment');

const parkingSpot = require('./ParkingSpot.js');

const store = require('../store');

const util = require('util');

const mathjs = require('mathjs');

var builder = require('xmlbuilder');

var featureLookup = [];        
var parkings = [];
var pushBackNodeLookup = [];

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


exports.writeGroundnetXML = function (fDir, icao, featureList) {
    try {
        var f = path.join(fDir, icao[0], icao[1], icao[2], icao + '.groundnet.new.xml');

        if (f == null)
            return;

        console.log(featureList);

        var parkings = featureList.map(mapParkings).filter(n => n);
        var runwayNodes = featureList.map(mapRunwayNodes).filter(n => n);
        var holdNodes = featureList.map(mapHoldPoint).filter(n => n);
        holdNodes.forEach(n => {
            pushBackNodeLookup[n['@index']] = n;
        });
    
        var nodes = [];
        var arcList = [];
        var frequencies = [];

        var version = new Date().toUTCString() + ' by FlightgearAirports';
        var email = store.default.state.Settings.settings.email;        



        featureLookup = [];        
        // Loaded segments
        featureList.filter(o => o instanceof L.TaxiwaySegment).filter(n => n).forEach(element => {
            var begin = mapBeginNode(element);
            nodes[begin['@index']] = begin;
            var end = mapEndNode(element);
            nodes[end['@index']] = end;
        });
        // New segments 
        featureList.filter(o => o instanceof L.Polyline).filter(n => n).forEach(arcElement => {
            //            element._latlngs.forEach(latlng => { nodes[latlng.__vertex.glueindex] = mapVertexNode(latlng) });    
            var startIndex = -1;
            console.log(arcElement.options.attributes);
            var currentArc = arcElement.options.attributes;
            arcElement._latlngs.forEach( latlng => {
                if (latlng.__vertex !== undefined && latlng.__vertex.glueindex !== undefined) {
                    nodes[latlng.__vertex.glueindex] = mapVertexNode(latlng);
                    if (startIndex >= 0) {
                        if (featureLookup[startIndex] == undefined) {
                            featureLookup[startIndex] = [];
                        }
                        if (featureLookup[latlng.__vertex.glueindex] == undefined) {
                            featureLookup[latlng.__vertex.glueindex] = [];
                        }
                        if( currentArc.direction === 'bi-directional' || currentArc.direction === 'forward' ){
                            arc = { '@begin': startIndex, '@end': String(latlng.__vertex.glueindex) };
                            styleArc(currentArc, arc);
                            arcList.push(arc);
                            featureLookup[startIndex][latlng.__vertex.glueindex] = arc;    
                        }
                        if( currentArc.direction === 'bi-directional' || currentArc.direction === 'backward' ){
                            arc = { '@begin': String(latlng.__vertex.glueindex), '@end': startIndex };
                            styleArc(currentArc, arc);
                            arcList.push(arc);
                            featureLookup[latlng.__vertex.glueindex][startIndex] = arc;
                        }
                    }
                    startIndex = latlng.__vertex.glueindex;
                }
            });
        });
        runwayNodes.forEach(element => {
            if (nodes[element['@index']] != undefined) {
                nodes[element['@index']]['@isOnRunway'] = "1";                
            }
        });


        // delete the parkings 
        parkings.forEach(n => {
            nodes[n['@index']] = null;
            var pushBackNode = findRouteToPushback(Number(n['@index']))[0];
            if (pushBackNode!==undefined) {
              n['@pushBackRoute'] = pushBackNode;
            }
        });
        nodes = nodes.filter(n => n);

        nodes.sort((p, p2) => { return p['@index'] - p2['@index'] });
        var uniqueNodes = nodes.filter((v, i, a) => a.indexOf(v) === i);

        var maxId = uniqueNodes.slice(-1)[0]['@index'];

        var approachList = store.default.state.Frequencies.items.filter(f => f.type === 'APPROACH').map(mapFrequency);

        var awosList = store.default.state.Frequencies.items.filter(f => f.type === 'AWOS').map(mapFrequency);

        var clearanceList = store.default.state.Frequencies.items.filter(f => f.type === 'CLEARANCE').map(mapFrequency);

        var departureList = store.default.state.Frequencies.items.filter(f => f.type === 'DEPARTURE').map(mapFrequency);

        var groundList = store.default.state.Frequencies.items.filter(f => f.type === 'GROUND').map(mapFrequency);

        var towerList = store.default.state.Frequencies.items.filter(f => f.type === 'TOWER').map(mapFrequency);

        var unicomList = store.default.state.Frequencies.items.filter(f => f.type === 'UNICOM').map(mapFrequency);

        var xmlObj = { groundnet: { version: version, email: email, 
            'frequencies': { APPROACH: approachList, DEPARTURE: departureList, AWOS: awosList, CLEARANCE: clearanceList, GROUND: groundList, TOWER: towerList, UNICOM: unicomList },
            parkingList: { Parking: parkings }, TaxiNodes: { node: uniqueNodes }, TaxiWaySegments: { arc: arcList } } };

        xmlString = builder.create(xmlObj).end({ pretty: true });
        fs.writeFileSync(f, xmlString);
        console.log(xmlString);
    } catch (error) {
        console.error(error);
    }
    return layerGroup;
}

var mapFrequency = function (o) {
    return o.value;
}

var mapParkings = function (o) {
    console.log(o);
    if (o instanceof L.ParkingSpot) {
        var lat = convertLat(o.getLatLng());
        var lon = convertLon(o.getLatLng());
        // <Parking index="0" type="gate" name="GA_Parking" lat="S9 25.739923" lon="E160 2.927602" heading="67"  radius="44" airlineCodes="" />
        return { '@index': String(o['id']), '@type': o.options.attributes.type, '@name': o.options.attributes.name, '@lat': lat, '@lon': lon, '@heading': Number(o.options.attributes.heading%360).toFixed(1), '@radius': String(o.options.attributes.radius) };
    }
}

var mapRunwayNodes = function (o) {
    console.log(o);
    if (o instanceof L.RunwayNode) {
        return { '@index': String(o['glueindex']), '@lat': convertLat(o._latlng), '@lon': convertLon(o._latlng), '@isOnRunway': '1', '@holdPointType': 'none' };
    }
    if (o instanceof L.HoldNode) {
        // return { '@index': String(o['glueindex']), '@lat': convertLat(o._latlng), '@lon': convertLon(o._latlng), '@isOnRunway': '0', '@holdPointType': o['holdPointType'] };
    }
}

var mapHoldPoint = function (o) {
    if (o instanceof L.HoldNode) {
        return { '@index': String(o['glueindex']), '@holdPointType': o['holdPointType'] };
    }
}

var mapBeginNode = function (o) {
    if (o instanceof L.TaxiwaySegment) {
        console.log(o);
        // <Parking index="0" type="gate" name="GA_Parking" lat="S9 25.739923" lon="E160 2.927602" heading="67"  radius="44" airlineCodes="" />
        return { '@index': String(o['begin']), '@lat': convertLat(o._latlngs[0]), '@lon': convertLon(o._latlngs[0]), '@isOnRunway': '0', '@type': 'begin' };
    }
}

var mapEndNode = function (o) {
    if (o instanceof L.TaxiwaySegment) {
        console.log(o);
        // <Parking index="0" type="gate" name="GA_Parking" lat="S9 25.739923" lon="E160 2.927602" heading="67"  radius="44" airlineCodes="" />
        return { '@index': String(o['end']), '@lat': convertLat(o._latlngs[1]), '@lon': convertLon(o._latlngs[1]), '@isOnRunway': '0', '@type': 'end' };
    }
}

var mapVertexNode = function (l) {
    if (l instanceof L.LatLng) {
        console.log(l);
        // <Parking index="0" type="gate" name="GA_Parking" lat="S9 25.739923" lon="E160 2.927602" heading="67"  radius="44" airlineCodes="" />
        return { '@index': String(l.__vertex.glueindex), '@lat': convertLat(l), '@lon': convertLon(l), '@isOnRunway': '0', '@holdPointType': l.attributes['holdPointType'] };
    }
}

var convertLat = function (latlng) {
    console.log(latlng.lat);
    var NS = latlng.lat > 0 ? 'N' : 'S';
    var deg = mathjs.floor(mathjs.abs(latlng.lat));
    var min = (mathjs.abs(latlng.lat) - deg) * 60;
    // console.log(NS + deg + " " + min);
    return NS + String(deg).padStart(2, '0') + " " + mathjs.round(min, 3);
}

var convertLon = function (latlng) {
    console.log(latlng.lng);
    var NS = latlng.lng > 0 ? 'E' : 'W';
    var deg = mathjs.floor(mathjs.abs(latlng.lng));
    var min = (mathjs.abs(latlng.lng) - deg) * 60;
    // console.log(NS + deg + " " + min);
    return NS + String(deg).padStart(2, '0') + " " + mathjs.round(min, 3);
}

var styleArc = function (attributes, arc) {
    console.log(attributes);
    if(attributes !== undefined){
        if (attributes.isPushBackRoute !== undefined && Number(attributes.isPushBackRoute) === 1 ) {
            arc['@isPushBackRoute'] = "1";
        } else {
            arc['@isPushBackRoute'] = "0";
        }
        arc['@name'] = attributes.name;    
    }
}