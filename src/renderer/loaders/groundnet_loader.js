/* eslint-disable */
const fs = require('fs');
const path = require('path');
var xamel = require('xamel');
const convert = require('geo-coordinates-parser');

const markers = require('./MagneticVertex');
const TaxiwaySegment = require('./TaxiwaySegment');

const parkingSpot = require('./ParkingSpot.js');
const runwayNode = require('./RunwayNode.js');

const store = require('../store');

const util = require('util');

var $ = require('jquery');

var featureLookup = {};

exports.addFeature = function (feature) {
    featureLookup[feature.id] = new Array();
}

exports.readGroundnetXML = function (fDir, icao, force) {
    try {
        layerGroup = L.layerGroup();
        layerGroup.maxId = 0;
        var f = path.join(fDir, icao[0], icao[1], icao[2], icao + '.groundnet.xml');
        var fNew = path.join(fDir, icao[0], icao[1], icao[2], icao + '.groundnet.new.xml');

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
            var parkingNodes = xml.find('groundnet/parkingList/Parking');
            console.log("Parking Nodes" + parkingNodes.length);

            var merged = new Array();

            var nodesLookup = {};

            parkingNodes.map(n => {
                var circle = parkingSpot(n, layerGroup);
                nodesLookup[n.attr('index')] = n;
                featureLookup[n.attr('index')] = new Array();
                featureLookup[n.attr('index')].push(circle);
                layerGroup.maxId = Math.max(layerGroup.maxId, Number(n.attr('index')))
                features.push(circle);
            }).sort();
            // Get all nodes into the lookup
            var taxiNodes = xml.find('groundnet/TaxiNodes/node');
            taxiNodes.map(n => {
                //attrs.lat
                //console.log(n.attr('lat') + " " + n.attr('lon'));
                var latlon = convert(n.attr('lat') + " " + n.attr('lon'));
                //console.log(latlon.decimalLatitude);

                layerGroup.maxId = Math.max(layerGroup.maxId, Number(n.attr('index')))
                nodesLookup[n.attr('index')] = n;
                if (n.attr('isOnRunway') === '1') {
                    var rNode = runwayNode(n, layerGroup);
                    if (featureLookup[rNode.glueindex] === undefined) {
                        featureLookup[rNode.glueindex] = [];
                    }
                    featureLookup[rNode.glueindex].push(rNode);
                }
                //store.default.dispatch('setNode', n)
            }).sort();


            var taxiArcs = xml.find('groundnet/TaxiWaySegments/arc');
            taxiArcs.map(n => {
                var begin = nodesLookup[n.attr('begin')];
                var end = nodesLookup[n.attr('end')];
                if (typeof begin !== 'undefined' && typeof end !== 'undefined') {
                    var bidirectional = false;
                    if (typeof featureLookup[n.attr('begin')] !== 'undefined') {
                        featureLookup[n.attr('begin')].forEach(element => {
                            if (element instanceof L.TaxiwaySegment && element.end === n.attr('begin') && element.begin === n.attr('end')) {
                                element.bidirectional = true;
                                bidirectional = true;
                            }
                        });
                    }
                    if (typeof featureLookup[n.attr('end')] !== 'undefined') {
                        featureLookup[n.attr('end')].forEach(element => {
                            if (element instanceof L.TaxiwaySegment && element.end === n.attr('begin') && element.begin === n.attr('end')) {
                                element.bidirectional = true;
                                bidirectional = true;
                            }
                        });
                    }
                    if (!bidirectional) {
                        var beginlatlon = convert(begin.attr('lat') + " " + begin.attr('lon'));
                        var endlatlon = convert(end.attr('lat') + " " + end.attr('lon'));
                        var polyline = new L.TaxiwaySegment([[beginlatlon.decimalLatitude, beginlatlon.decimalLongitude], [endlatlon.decimalLatitude, endlatlon.decimalLongitude]], { attributes: {} }).addTo(layerGroup);
                        polyline._latlngs[0].attributes = {};
                        $.each(begin.attrs, function (key, value) {
                            console.log(key + "\t" + value);

                            if (isNaN(value))
                                polyline._latlngs[0].attributes[key] = value;
                            else
                                polyline._latlngs[0].attributes[key] = Number(value);
                        });
                        polyline._latlngs[1].attributes = {};
                        $.each(end.attrs, function (key, value) {
                            console.log(key + "\t" + value);

                            if (isNaN(value))
                                polyline._latlngs[1].attributes[key] = value;
                            else
                                polyline._latlngs[1].attributes[key] = Number(value);
                        });
                        $.each(n.attrs, function (key, value) {
                            console.log(key + "\t" + value);

                            if (isNaN(value))
                                polyline.options.attributes[key] = value;
                            else
                                polyline.options.attributes[key] = Number(value);
                        });
                        polyline.updateStyle();

                        polyline.begin = begin.attr('index');
                        polyline.end = end.attr('index');
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


            return layerGroup;
        });
        //                  var jsonAirports = JSON.parse(geoJSON);
        //        return jsonAirports;
    } catch (error) {
        console.error(error);
    }
    return layerGroup;
};