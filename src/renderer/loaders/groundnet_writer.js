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
 

exports.writeGroundnetXML = function (fDir, icao, featureList) {
    try {        
        var f = path.join(fDir, icao[0], icao[1], icao[2], icao + '.groundnet.new.xml');

        if (f == null)
            return;

        console.log(featureList);

        var parkings = featureList.map(mapParkings).filter(n => n);
        
        var nodes = [];
        featureList.filter(o => o instanceof L.TaxiwaySegment).filter(n => n).forEach(element => {
            var begin = mapBeginNode(element);
            nodes[begin['@index']] = begin;
            var end = mapEndNode(element);
            nodes[end['@index']] = end;
        });

        // delete the parkings 
        parkings.forEach( n => {
            nodes[n['@index']] = null;
        } );
        nodes = nodes.filter(n => n);

        nodes.sort((p, p2) => {return p['@index']- p2['@index'] });
        var uniqueNodes = nodes.filter( (v, i, a) => a.indexOf(v) === i );

        var maxId = uniqueNodes.slice(-1)[0]['@index'];

        var arcList = [];
        featureList.filter(o => o instanceof L.TaxiwaySegment).filter(n => n).forEach(element => {

            if (element.getLatLngs().length > 2) {
                let middlePoints = element.getLatLngs().slice(1,-1);
                let startIndex = element.begin;
                middlePoints.forEach(latlng => {
                    uniqueNodes.push({'@index': String(++maxId), '@lat': convertLat(latlng), '@lon': convertLon(latlng)});
                    arc = {'@begin': startIndex, '@end': String(maxId)};
                    arcList.push(arc);
                    arc = {'@begin': String(maxId), '@end': startIndex};
                    arcList.push(arc);
                    startIndex = maxId;
                });
                arc = {'@begin': String(startIndex), '@end': element.end};
                arcList.push(arc);
                arc = {'@begin': element.end, '@end': String(startIndex)};
                arcList.push(arc);
                console.log('We have a edited line');                
            }
            else {
                arc = {'@begin': element.begin, '@end': element.end };
                arcList.push(arc);
                if (element.bidirectional) {
                    arc = {'@begin': element.end, '@end': element.begin };
                    arcList.push(arc);                    
                }    
            }
            // <arc begin="0" end="161" isPushBackRoute="1" name="" />            
        });


        var xmlObj = {groundnet: {version:1, parkingList:{ Parking: parkings }, TaxiNodes: { node: uniqueNodes}, TaxiWaySegments: { arc: arcList}}};

        xmlString = builder.create(xmlObj).end({ pretty: true});
        fs.writeFileSync(f,xmlString);
        console.log(xmlString);
      } catch (error) {
        console.error(error);
    }
    return layerGroup;
}

var mapParkings = function( o ) {
    console.log(o);
    if (o instanceof L.ParkingSpot) {
        var lat = convertLat(o.getLatLng());
        var lon = convertLon(o.getLatLng());
        // <Parking index="0" type="gate" name="GA_Parking" lat="S9 25.739923" lon="E160 2.927602" heading="67"  radius="44" airlineCodes="" />
        return {'@index': String(o['id']), '@type': o.options.attributes.type, '@name': o.options.attributes.name, '@lat': lat, '@lon': lon, '@heading': Number(o.options.attributes.heading), '@radius': String(o.options.radius)};
    }
}

var mapBeginNode = function( o ) {
    if (o instanceof L.TaxiwaySegment) {        
        console.log(o);
        // <Parking index="0" type="gate" name="GA_Parking" lat="S9 25.739923" lon="E160 2.927602" heading="67"  radius="44" airlineCodes="" />
        return {'@index': String(o['begin']), '@lat': convertLat(o._latlngs[0]), '@lon': convertLon(o._latlngs[0])};
    }
}

var mapEndNode = function( o ) {
    if (o instanceof L.TaxiwaySegment) {        
        console.log(o);
        // <Parking index="0" type="gate" name="GA_Parking" lat="S9 25.739923" lon="E160 2.927602" heading="67"  radius="44" airlineCodes="" />
        return {'@index': String(o['end']), '@lat': convertLat(o._latlngs[1]), '@lon': convertLon(o._latlngs[1])};
    }
}

var convertLat = function( latlng ) {
    console.log(latlng.lat);
    var NS = latlng.lat>0?'N':'S';
    var deg = mathjs.abs(mathjs.floor(latlng.lat));
    var min = (mathjs.abs(latlng.lat) - deg) * 60;
    // console.log(NS + deg + " " + min);
    return NS + String(deg).padStart(2, '0') + " " + mathjs.round( min, 3 );
}

var convertLon = function( latlng ) {
    console.log(latlng.lng);
    var NS = latlng.lat<0?'E':'W';
    var deg = mathjs.floor(mathjs.abs(latlng.lng));
    var min = (mathjs.abs(latlng.lng) - deg) * 60;
    // console.log(NS + deg + " " + min);
    return NS + String(deg).padStart(2, '0') + " " + mathjs.round( min, 3 );
}