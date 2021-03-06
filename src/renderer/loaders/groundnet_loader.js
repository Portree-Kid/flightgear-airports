/* eslint-disable */
const fs = require('fs');
const path = require('path');
var xamel = require('xamel');
const convert = require('geo-coordinates-parser');

const parkingSpot = require('./ParkingSpot.js');
const runwayNode = require('./RunwayNode.js');
const holdNode = require('./HoldNode.js');
const extendTaxiSegment = require('./TaxiwaySegmentExtender').extendTaxiSegment;

const store = require('../store');

const util = require('util');

var $ = require('jquery');

var featureLookup = {};

var frequencies = [];

function addFrequencies (type, value) {
    value.split(' ').forEach(frequencyValue => {
        if( value.length > 0) {
            var frequency = {type: type, value: frequencyValue};
            frequencies.push(frequency);
        }
    })
}

exports.addFeature = function (feature) {
    featureLookup[feature.id] = [];
}

exports.listSaves = function (fDir, icao) {
    var directory = path.join(fDir, icao[0], icao[1], icao[2]);
    var files = fs.readdirSync(directory);
    var ret = files
    .filter(f => f.includes(icao) )
    .filter(f => f.includes('groundnet') )
    .map(f => {
        try {
            var fileDate = fs.lstatSync(path.join(directory, f));
            return {file: f, mtime: `${fileDate.mtime}`, mtimeMs: `${fileDate.mtimeMs}`};
        } catch (error) {
            console.error(error);
        }
    });
    ret.forEach( f => {
        console.debug(f);
    });
    return ret;
}

exports.readGroundnetXML = function (fDir, icao, f) {
    try {
        store.default.dispatch('setGroundnetLoaded', false);
        var layerGroup = L.layerGroup();
        layerGroup.minId = 9999999999;
        layerGroup.maxId = 0;

        if (f == null || (!fs.existsSync(f) ))
            return layerGroup;

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
            // <frequencies>
            //   <AWOS>13135</AWOS>
            //   <GROUND>12175</GROUND>
            //   <TOWER>11870</TOWER>
            //   <APPROACH>12120</APPROACH>
            // </frequencies>

            frequencies = [];
            var approach = xml.find('groundnet/frequencies/APPROACH/text()').text();
            addFrequencies('APPROACH', approach);
            var awos = xml.find('groundnet/frequencies/AWOS/text()').text();
            addFrequencies('AWOS', awos);
            var clearance = xml.find('groundnet/frequencies/CLEARANCE/text()').text();
            addFrequencies('CLEARANCE', clearance);
            var departure = xml.find('groundnet/frequencies/DEPARTURE/text()').text();
            addFrequencies('DEPARTURE', departure);
            var ground = xml.find('groundnet/frequencies/GROUND/text()').text();
            addFrequencies('GROUND', ground);
            var tower = xml.find('groundnet/frequencies/TOWER/text()').text();
            addFrequencies('TOWER', tower);
            var unicom = xml.find('groundnet/frequencies/UNICOM/text()').text();
            addFrequencies('UNICOM', unicom);

            store.default.dispatch('setFrequencies', frequencies);

            var parkingNodes = xml.find('groundnet/parkingList/Parking');
            console.debug("Parking Nodes length" + parkingNodes.length);

            var merged = new Array();

            var nodesLookup = {};
            featureLookup = [];


            parkingNodes.map(n => {
                var circle = parkingSpot(n, layerGroup);
                nodesLookup[n.attr('index')] = n;
                featureLookup[n.attr('index')] = new Array();
                featureLookup[n.attr('index')].push(circle);
                layerGroup.minId = Math.min(layerGroup.minId, Number(n.attr('index')))
                layerGroup.maxId = Math.max(layerGroup.maxId, Number(n.attr('index')))
                features.push(circle);
            }).sort();

            store.default.dispatch('setParkings', parkingNodes.map(
                p => ({index: Number(p.attrs.index), radius: Number(p.attrs.radius), name: String(p.attrs.name), number: String(p.attrs.number), type: String(p.attrs.type)}
            )).sort((p1, p2) => {
                if (p1.name === p2.name) {
                    return p1.number?p1.number.localeCompare(p2.number):-1;
                } else {
                  return p1.name.localeCompare(p2.name)
                }}));

            // Get all nodes into the lookup
            var taxiNodes = xml.find('groundnet/TaxiNodes/node');
            taxiNodes.map(n => {
                //attrs.lat
                //console.log(n.attr('lat') + " " + n.attr('lon'));
                try {
                    var latlon = convert(n.attr('lat') + " " + n.attr('lon'));
                } catch (error) {
                    console.warn(n.attr('lat') + " " + n.attr('lon'));
                    convert(n.attr('lat') + " " + n.attr('lon'));
                }
                //console.log(latlon.decimalLatitude);

                layerGroup.minId = Math.min(layerGroup.minId, Number(n.attr('index')))
                layerGroup.maxId = Math.max(layerGroup.maxId, Number(n.attr('index')))
                console.debug(`Min Id : ${layerGroup.minId} Max Id : ${layerGroup.maxId} `);

                nodesLookup[n.attr('index')] = n;
                if (n.attr('isOnRunway') === '1') {
                    var rNode = runwayNode(n, layerGroup);
                    if (featureLookup[rNode.glueindex] === undefined) {
                        featureLookup[rNode.glueindex] = [];
                    }
                    featureLookup[rNode.glueindex].push(rNode);
                }
                if (n.attr('holdPointType') !== 'none' && n.attr('holdPointType') !== null) {
                    var hNode = holdNode(n, layerGroup);
                    if (featureLookup[hNode.glueindex] === undefined) {
                        featureLookup[hNode.glueindex] = [];
                    }
                    featureLookup[hNode.glueindex].push(hNode);
                }

                //store.default.dispatch('setNode', n)
            }).sort();


            var taxiArcs = xml.find('groundnet/TaxiWaySegments/arc');
            taxiArcs.map(n => {
                var beginNode = nodesLookup[n.attr('begin')];
                var endNode = nodesLookup[n.attr('end')];
                if (typeof beginNode !== 'undefined' && typeof endNode !== 'undefined') {
                    var bidirectional = false;
                    if (typeof featureLookup[n.attr('begin')] !== 'undefined') {
                        featureLookup[n.attr('begin')].forEach(element => {
                            if (element instanceof L.Polyline && element.end === n.attr('begin') && element.begin === n.attr('end')) {
                                element.bidirectional = true;
                                element.options.attributes.direction = 'bi-directional'
                                bidirectional = true;
                                element.updateStyle();
                            }
                        });
                    }
                    if (typeof featureLookup[n.attr('end')] !== 'undefined') {
                        featureLookup[n.attr('end')].forEach(element => {
                            if (element instanceof L.Polyline && element.end === n.attr('begin') && element.begin === n.attr('end')) {
                                element.bidirectional = true;
                                element.options.attributes.direction = 'bi-directional'
                                bidirectional = true;
                                element.updateStyle();
                            }
                        });
                    }
                    if (!bidirectional) {
                        var beginlatlon = convert(beginNode.attr('lat') + " " + beginNode.attr('lon'));
                        var endlatlon = convert(endNode.attr('lat') + " " + endNode.attr('lon'));

                        var pane = 'route-pane';
                        if(n.attr('isPushBackRoute') === '1') {
                           pane = 'pushback-pane';
                        }

                        var polyline = new L.Polyline([[beginlatlon.decimalLatitude, beginlatlon.decimalLongitude], [endlatlon.decimalLatitude, endlatlon.decimalLongitude]], { pane: pane, attributes: {} }).addTo(layerGroup);
                        extendTaxiSegment(polyline);
                        polyline.addListeners();
                        polyline._latlngs[0].attributes = {};
                        $.each(beginNode.attrs, function (key, value) {
                            console.debug(key + "\t" + value);

                            if (isNaN(value))
                                polyline._latlngs[0].attributes[key] = value;
                            else
                                polyline._latlngs[0].attributes[key] = Number(value);
                        });
                        polyline._latlngs[1].attributes = {};
                        $.each(endNode.attrs, function (key, value) {
                            console.debug(key + "\t" + value);

                            if (isNaN(value))
                                polyline._latlngs[1].attributes[key] = value;
                            else
                                polyline._latlngs[1].attributes[key] = Number(value);
                        });
                        $.each(n.attrs, function (key, value) {
                            console.debug(key + "\t" + value);

                            if (isNaN(value))
                                polyline.options.attributes[key] = value;
                            else
                                polyline.options.attributes[key] = Number(value);
                        });
                        polyline.options.attributes.direction = 'forward'
                        polyline.updateStyle();

                        polyline.begin = beginNode.attr('index');
                        polyline.end = endNode.attr('index');
                        polyline.feature = { properties: { searchTerm:  'Arc ' + beginNode.attr('index') + '-' + endNode.attr('index')}};

                        // polyline.enableEdit();

                        // polyline.on('dblclick', function (event) { L.DomEvent.stop; polyline.toggleEdit; });

                        if (featureLookup[n.attr('begin')] == undefined) {
                            featureLookup[n.attr('begin')] = [];
                        }
                        if (featureLookup[n.attr('end')] == undefined) {
                            featureLookup[n.attr('end')] = [];
                        }
                        featureLookup[n.attr('begin')].push(polyline);
                        featureLookup[n.attr('end')].push(polyline);
                        polyline.addTo(layerGroup);
                    }
                }
            }).sort();
            store.default.dispatch('setGroundnetLoaded', true);

            return layerGroup;
        });
        //                  var jsonAirports = JSON.parse(geoJSON);
        //        return jsonAirports;
    } catch (error) {
        console.error(error);
    }
    return layerGroup;
};