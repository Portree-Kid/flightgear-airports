/* eslint-disable */
const fs = require('fs');
const path = require('path');
var xamel = require('xamel');
const convert = require('geo-coordinates-parser');

const markers = require('./markers');

const parkingSpot = require('./ParkingSpot.js');

const util = require('util');

console.log(convert.formats);

var featureLookup = {};

exports.readGroundnetXML = function (fDir, icao) {
    try {
        layerGroup = L.layerGroup();
        var f = path.join(fDir, icao[0], icao[1], icao[2], icao + '.groundnet.xml');

        if (f == null || !fs.existsSync(f))
            return;

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
                circle.on('editable:drawing:move', function (event) {
//                    console.log("Follow 1: " + event.sourceTarget );                    
//                    console.log("Follow 2: " + event.sourceTarget._dragStartTarget );                    
//                    console.log("Follow 3: " + event.target.editor._resizeLatLng.__vertex );                    
//                    console.log("Follow 4: " + event.target.editor._resizeLatLng.__vertex._icon );                    
//                    console.log("Follow 5: " + (event.target.editor._resizeLatLng.__vertex === event.sourceTarget) );                    
//                    console.log("Follow 6: " + (event.target.editor._resizeLatLng.__vertex._icon === event.sourceTarget._element) );                    
//                    console.log("Follow 7: " + (event.target.editor._resizeLatLng.__vertex._icon === event.sourceTarget._dragStartTarget) );                    
//                    console.log("Follow 8: " + (event.target.editor._resizeLatLng.__vertex._icon._leaflet_id === event.sourceTarget._dragStartTarget._leaflet_id) );                    

                    // Is it the edit vertex moving?
                    if(event.target.editor._resizeLatLng.__vertex._icon !== event.sourceTarget._element){
                        follow(event.target.id, event);
                    }

                });
                nodesLookup[n.attr('index')] = n;
                featureLookup[n.attr('index')] = new Array();
                featureLookup[n.attr('index')].push(circle);

                features.push(circle);
            }).sort();
            // Get all nodes into the lookup
            var taxiNodes = xml.find('groundnet/TaxiNodes/node');
            taxiNodes.map(n => {
                //attrs.lat
                //console.log(n.attr('lat') + " " + n.attr('lon'));
                var latlon = convert(n.attr('lat') + " " + n.attr('lon'));
                //console.log(latlon.decimalLatitude);

                nodesLookup[n.attr('index')] = n;
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
                        const polyline = new L.TaxiwaySegment([[beginlatlon.decimalLatitude, beginlatlon.decimalLongitude], [endlatlon.decimalLatitude, endlatlon.decimalLongitude]], { radius: n.attr('radius') }).addTo(layerGroup);
                        polyline.begin = begin.attr('index');
                        polyline.end = end.attr('index');
                        // polyline.enableEdit();

                        polyline.on('dblclick', function (event) { L.DomEvent.stop; polyline.toggleEdit; });
                        polyline.on('click', function (event) {
                            console.log(event);
                        });
                        polyline.on('editable:drawing:move', function (event) {
                            console.log(event.target);
                            if (dragIndex >= 0) {
                                follow(dragIndex, event);
                            }
                        });
                        var dragIndex = -1;
                        polyline.on('editable:vertex:dragstart', function (event) {
                            console.log(event.vertex);
                            console.log(event.target);
                            if (typeof featureLookup[event.target.begin] !== 'undefined') {
                                featureLookup[event.target.begin].forEach(element => {
                                    if (element instanceof L.ParkingSpot) {
                                        dragIndex = event.target.begin;
                                    }
                                    else if (element instanceof L.TaxiwaySegment) {
                                        if (element.getLatLngs()[0].equals(event.vertex.getLatLng())) {
                                            dragIndex = element.begin;
                                        }
                                        if (element.getLatLngs()[element.getLatLngs().length - 1].equals(event.vertex.getLatLng())) {
                                            dragIndex = element.end;
                                        }
                                    }
                                });
                            }
                            if (typeof featureLookup[event.target.end] !== 'undefined') {
                                featureLookup[event.target.end].forEach(element => {
                                    if (element instanceof L.ParkingSpot) {
                                        dragIndex = event.target.end;
                                    }
                                });
                            }
                        });
                        polyline.on('editable:vertex:dragend', function (event) {
                            console.log(event.vertex);
                            if (dragIndex > 0) {
                                featureLookup[dragIndex].forEach(element => {
                                    if (element instanceof L.ParkingSpot) {
                                        //element.setLatLng(event);
                                        console.log(element);
                                    }
                                });
                            }
                            dragIndex = -1;
                        });


                        polyline.addTo(layerGroup);
                        if (typeof featureLookup[polyline.begin] === 'undefined') {
                            featureLookup[polyline.begin] = new Array();
                        }
                        if (typeof featureLookup[polyline.end] === 'undefined') {
                            featureLookup[polyline.end] = new Array();
                        }
                        featureLookup[polyline.begin].push(polyline);
                        featureLookup[polyline.end].push(polyline);
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
}

follow = function (dragIndex, event) {
    featureLookup[dragIndex].forEach(element => {
        if(element !== event.target){
            if (element instanceof L.ParkingSpot) {
                element.disableEdit();
                element.setLatLng(event.latlng);
                // element.enableEdit();
                element.updateVertexFromDirection();
            }
            else if (element instanceof L.TaxiwaySegment) {
                if (element.begin === dragIndex) {
                    element.getLatLngs()[0].update(event.latlng);
                    element.setLatLngs(element.getLatLngs());
                    element.updateBeginVertex(event.latlng);
                    element.updateMiddle();
                }
                if (element.end === dragIndex) {
                    element.getLatLngs()[element.getLatLngs().length - 1].update(event.latlng);
                    element.setLatLngs(element.getLatLngs());
                    element.updateEndVertex(event.latlng);
                    element.updateMiddle();
                }
    
            }    
        }
    });

}