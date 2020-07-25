/* eslint-disable */
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/src/renderer/utils/`
    : `file://${process.resourcesPath}/workers/`

var path = require('path');
const fs = require('fs');
//debugger;
var turf;

var check_msg;

if (process.env.NODE_ENV === 'development') {
    importScripts('../../../node_modules/dijkstrajs/dijkstra.js');
    turf = require('./node_modules/@turf/turf');
} else if (process.env.NODE_ENV === 'mocha') {
    importScripts('../../../node_modules/dijkstrajs/dijkstra.js');
    turf = require('../../../node_modules/@turf/turf')
} else {
    importScripts('dijkstra.js');
    turf = require('@turf/turf')
}

const homedir = require('os').homedir();

importScripts('logger.js');
importScripts('haversine.js');

function errorReceiver(event) {
    throw event.data;
}

onmessage = function (event) {
    postMessage('checkStarted');
    logger('info', 'Check Started');
    console.log(event.data);
    if (event.data[0] === 'check') {
        checkGroundnet(event.data[1]).then(result => {
            console.log("DONE Checking");
            postMessage(['DONE', result]);
            // event.origin.webContents.send('scanFinished');
        }
        ).catch(result => {
            console.error('Crashed');
            console.error(result);
            postMessage(['DONE', []]);
        });
    }
};

/**
 * Implements the checks of the groundnet
 * @param {*} data 
 */

async function checkGroundnet(data) {
    var promise = new Promise(function (resolve, reject) {
        try {
            check_msg = JSON.parse(fs.readFileSync('./src/renderer/utils/check_msg.json', 'utf8').toString());
            //debugger;
            var parkings = data.map(mapParkings).filter(n => n !== undefined);
            var runwayNodeIDs = data.map(mapRunwayNodeId).filter(n => n !== undefined);
            var runwayNodes = data.map(mapRunwayNode).filter(n => n !== undefined);
            var pushbackNodes = data.map(mapPushbackNodes).filter(n => n !== undefined);
            var edges = data.map(mapEdges).filter(n => n !== undefined);

            var normalNodes = data.map(mapEdges).filter(n => n !== undefined)
            .flatMap(m => m.latLngs).filter(n => runwayNodeIDs.indexOf(Number(n.index)) < 0);

            var runways = data.map(mapRunways).filter(n => n !== undefined);

            this.max = 4 * parkings.length * runwayNodeIDs.length +
                3 * parkings.length;
            this.postMessage(['max', this.max]);

            var boxes = {};
            //debugger;
            data.forEach(element => {
                //debugger;
                if (element.box !== undefined && element.box !== null) {
                    boxes[element.index] = element.box[0].map(latlng => [latlng.lat, latlng.lng]);
                    boxes[element.index].push(boxes[element.index][0]);
                }
            });
            var directionalGraph = {};
            var bidirectionalGraph = {};

            console.log(parkings);
            parkings.forEach(element => {
                directionalGraph[element] = {};
                bidirectionalGraph[element] = {};
            });
            runwayNodeIDs.forEach(element => {
                directionalGraph[element] = {};
                bidirectionalGraph[element] = {};
            });
            var notOkNodes = [];
            debugger;

            console.log(edges);
            if (edges === undefined) {
                resolve({});
            }
            edges.forEach(edge => {
                directionalGraph[edge.start] = {};
                bidirectionalGraph[edge.start] = {};
                directionalGraph[edge.end] = {};
                bidirectionalGraph[edge.end] = {};
                if (edge.latLngs !== undefined) {
                    // Check if there are segments > 2km
                    edge.latLngs.forEach((latLng, index, arr) => {
                        if (index > 0) {
                            var d = distance([arr[index - 1].lng, arr[index - 1].lat], [latLng.lng, latLng.lat]);
                            if (d > 2000) {
                                notOkNodes.push({ id: Number(arr[index - 1].index), message: check_msg.LONG_ROUTE_START });
                                notOkNodes.push({ id: Number(arr[index].index), message: check_msg.LONG_ROUTE_END });
                            }
                            //console.log(d);
                        }
                    });
                }
            });
            // Add edges to directionalGraph
            edges.forEach(element => {
                var node1 = directionalGraph[element.start];
                var node2 = directionalGraph[element.end];
                if (element.direction === undefined) {
                    notOkNodes.push({ id: Number(element._leaflet_id), message: check_msg.EDGE_MISSING_DIRECTION });
                }

                if (element.direction === 'bi-directional' || element.direction === 'forward') {
                    node1[Number(element.end)] = 1;
                }
                if (element.direction === 'bi-directional' || element.direction === 'backward') {
                    node2[Number(element.start)] = 1;
                }

                var node3 = bidirectionalGraph[element.start];
                var node4 = bidirectionalGraph[element.end];
                node3[Number(element.end)] = 1;
                node4[Number(element.start)] = 1;
            });
            var isLegitEnd = function (v) {
                if (Object.keys(bidirectionalGraph[v]).length <= 1) {
                    return true;
                }
                return Object.keys(bidirectionalGraph[v]).filter(v => runwayNodeIDs[v]).length === 0;
            }
            //debugger;
            runwayNodeIDs = runwayNodeIDs.filter(
                (v, i) => isLegitEnd(v)
            );
            // Check if there is a route from every parking to every runway node            
            var okNodes = [];
            logger('info', directionalGraph);
            parkings.forEach(parkingNode => {
                runwayNodeIDs.forEach(runwayNode => {
                    var ok = checkRoute(directionalGraph, parkingNode, runwayNode);
                    if (ok) {
                        okNodes.push(parkingNode);
                        okNodes.push(runwayNode);
                    } else {
                        console.log(`No route from Parking ${parkingNode} to Runwaynode ${runwayNode}`);
                    }
                    this.postMessage(['progress', 1]);
                });
            });
            // Build pushback directionalGraph
            var noPushbackGraph = {};
            parkings.forEach(element => {
                noPushbackGraph[element] = {};
            });
            pushbackNodes.forEach(element => {
                noPushbackGraph[element] = {};
            });
            edges.filter(element => element.isPushBackRoute).forEach(element => {
                noPushbackGraph[element.start] = {};
                noPushbackGraph[element.end] = {};
            });
            // add all pushback edges
            edges.filter(element => element.isPushBackRoute).forEach(element => {
                var node1 = noPushbackGraph[Number(element.start)];
                node1[Number(element.end)] = 1;
                var node2 = noPushbackGraph[Number(element.end)];
                node2[Number(element.start)] = 1;
            });


            var okPushbacks = [];
            // Check pushback
            var multiplePushbackRoutes = {};
            //debugger;
            parkings.forEach(parkingNode => {
                pushbackNodes.forEach(pushbackNode => {
                    var numRoutes = checkRoute(noPushbackGraph, parkingNode, pushbackNode);
                    if (numRoutes === 0) {
                        /*
                        if(parkingNode===14) {
                            debugger;
                        }
                        */
                        if (multiplePushbackRoutes[parkingNode] === undefined &&
                            Object.keys(noPushbackGraph[parkingNode]) > 0) {
                            // Only when there is a edge leaving     
                            multiplePushbackRoutes[parkingNode] = [];
                        }
                    } else if (numRoutes === 1) {
                        if (multiplePushbackRoutes[parkingNode] === undefined) {
                            multiplePushbackRoutes[parkingNode] = [pushbackNode];
                        } else {
                            multiplePushbackRoutes[parkingNode].push(pushbackNode);
                        }
                    } else if (numRoutes > 1) {
                        if (multiplePushbackRoutes[parkingNode] === undefined) {
                            multiplePushbackRoutes[parkingNode] = [pushbackNode];
                        } else {
                            multiplePushbackRoutes[parkingNode].push(pushbackNode);
                        }
                    }
                    this.postMessage(['progress', 1]);
                });
            });
            var rogueHoldPoints = pushbackNodes.map(
                id => {
                    var routes = noPushbackGraph[id];
                    if (Object.keys(routes).length < 1)
                        return { id: id, message: check_msg.UNCONNECTED_PUSHBACK }
                    /*
                    else if(Object.keys(routes).length>1)
                      return { id: id, message: 'Multiple connected pushback node' }
                    */
                }
            ).filter(n => n !== undefined);
            var wrongPushbackRoutes = parkings.filter(
                function (e) {
                    //debugger;
                    return this[e] != undefined && this[e].length != 1;
                }
                , multiplePushbackRoutes).map(
                    id => {
                        var endPoints = multiplePushbackRoutes[id];
                        if (endPoints.length < 1)
                            return { id: id, message: check_msg.NO_WAY_TO_HOLDPOINT }
                        else
                            return { id: id, message: check_msg.MULTIPLE_PUSHBACK }
                    }
                );
            //wrongPushbackRoutes = wrongPushbackRoutes.concat(multiplePushbackRoutes);

            okNodes = okNodes.filter((v, i) => okNodes.indexOf(v) === i);
            var notOkNodesParkings = parkings.filter(
                (v, i) => okNodes.indexOf(v) < 0
            ).map(
                id => { return { id: id, message: check_msg.NO_RUNWAY_ROUTE } }
            );
            var notOkNodesRunways = runwayNodeIDs.filter(
                (v, i) => okNodes.indexOf(v) < 0
            ).map(
                id => { return { id: id, message: check_msg.NO_RUNWAY_ROUTE } }
            );

            if (parkings.length === 0) {
                notOkNodes.push({ id: 0, message: check_msg.NO_PARKINGS });
            }
            if (runwayNodeIDs.length === 0) {
                notOkNodes.push({ id: 0, message: check_msg.NO_RUNWAY_NODES });
            }
            var allEnds = Object.entries(bidirectionalGraph).filter(
                (v, i) => Object.keys(v[1]).length <= 1
            );
            // Ends that are not on Runway and not a Parking or Pushback
            var allLegitimateEndNodes = parkings.concat(runwayNodeIDs).concat(pushbackNodes);
            var danglingEnds = allEnds.filter(
                (v, i) => allLegitimateEndNodes.indexOf(Number(v[0])) < 0
            ).map(
                v => { return { id: Number(v[0]), message: check_msg.NOT_LEGIT_END } }
            );

            var parkingNodes = data.map(mapParkingNode).filter(n => n !== undefined);

            var overlappingParkings = [];
            parkingNodes.forEach(parkingNode => {
                if (boxes[parkingNode.index] === undefined) {
                    overlappingParkings.push({ id: parkingNode.index, message: check_msg.UNKNOWN_RADIUS });
                }
            });
            // Check for intersecting radii
            parkingNodes.forEach(parkingNode => {
                parkingNodes.forEach(parkingNode1 => {
                    console.log(parkingNode, parkingNode1);
                    if (parkingNode.index !== parkingNode1.index) {
                        var d = distance([parkingNode.lng, parkingNode.lat],
                            [parkingNode1.lng, parkingNode1.lat]);
                        if (d < parkingNode.radius + parkingNode1.radius + 10) {
                            // If bigger circles intersect we should check the boxes
                            //debugger;
                            if (boxes[parkingNode.index] !== null && boxes[parkingNode1.index] !== null &&
                                boxes[parkingNode.index] !== undefined && boxes[parkingNode1.index] !== undefined) {
                                var poly1 = turf.polygon([boxes[parkingNode.index]]);

                                var poly2 = turf.polygon([boxes[parkingNode1.index]]);

                                var intersection = turf.intersect(poly1, poly2);
                                if (intersection !== null) {
                                    overlappingParkings.push({ id: parkingNode.index, message: check_msg.OVERLAPPING_PARKINGS });
                                }
                            }
                        }
                    }
                    this.postMessage(['progress', 1]);
                });
            });
            var invalidParkings = [];
            // Check for name
            parkingNodes.forEach(parkingNode => {
                if (!parkingNode.name || /^\s*$/.test(parkingNode.name)) {
                    invalidParkings.push({ id: parkingNode.index, message: check_msg.NAME_EMPTY });
                    this.postMessage(['progress', 1]);
                }
                if (!parkingNode.type) {
                    invalidParkings.push({ id: parkingNode.index, message: check_msg.TYPE_EMPTY });
                    this.postMessage(['progress', 1]);
                }
                if (['ga', 'cargo', 'gate', 'mil-fighter', 'mil-cargo'].indexOf(parkingNode.parkingType) < 0) {
                    //debugger;
                    invalidParkings.push({ id: parkingNode.index, message: check_msg.PARKING_TYPE_INVALID });
                    this.postMessage(['progress', 1]);
                }
            });

            //Check for dual pushback/runway nodes
            runwayNodeIDs.forEach(runwayNode => {
                if (pushbackNodes.indexOf(runwayNode) >= 0) {
                    notOkNodes.push({ id: runwayNode, message: check_msg.DUAL_PUSHBACK });
                }
            });
            //Check if runwaynodes are on runway
            runwayNodes.forEach(runwayNode => {
                //debugger;                
                if( runways.filter(r => turf.booleanContains(r, latToTurf(runwayNode))).length === 0 ) {
                    notOkNodes.push({ id: runwayNode.index, message: check_msg.RUNWAY_NODE_NOT_ON_RUNWAY });
                } 
            });

            //Check if nodes no normal nodes are on runway
            // debugger;                
            normalNodes.forEach(normalNode => {
                if( runways.filter(r => turf.booleanContains(r, latToTurf(normalNode))).length > 0 ) {
                    //debugger;
                    notOkNodes.push({ id: normalNode.index, message: check_msg.NON_RUNWAYNODE_ON_RUNWAY });
                } 
            });

            notOkNodes = notOkNodes.concat(invalidParkings);
            if (invalidParkings.length === 0) {
                notOkNodes.push({ id: -1, message: check_msg.PARKINGS_VALID });
            }
            notOkNodes = notOkNodes.concat(overlappingParkings);
            if (overlappingParkings.length === 0) {
                notOkNodes.push({ id: -1, message: check_msg.NO_OVERLAPPING_PARKINGS });
            }
            notOkNodes = notOkNodes.concat(danglingEnds);
            if (danglingEnds.length === 0) {
                notOkNodes.push({ id: -1, message: check_msg.NO_INVALID_ENDS });
            }
            notOkNodes = notOkNodes.concat(notOkNodesParkings).concat(rogueHoldPoints);
            if (notOkNodesParkings.length === 0 && rogueHoldPoints === 0) {
                notOkNodes.push({ id: -1, message: check_msg.ROUTES_FROM_PARKINGS_OK });
            }

            notOkNodes = notOkNodes.concat(notOkNodesRunways);
            if (notOkNodesRunways.length === 0) {
                notOkNodes.push({ id: -1, message: check_msg.ROUTES_FROM_RUNWAYS_OK });
            }
            notOkNodes = notOkNodes.concat(wrongPushbackRoutes);
            if (wrongPushbackRoutes.length === 0) {
                notOkNodes.push({ id: -1, message: check_msg.PUSHBACK_ROUTES_OK });
            }
            //        check1(directionalGraph);
            //        check2();
            //        this.postMessage(['progress', 1]);
            debugger;
            resolve(notOkNodes);

        } catch (error) {
            reject(error);
        }
    });
    return promise;
}

function checkRoute(directionalGraph, from, to) {
    try {
        var pathD = this.dijkstra.find_path(directionalGraph, from, to);
        if (pathD.length > 0) {
            console.log(pathD);
            return pathD.length;
        }
        return 0;
    } catch (error) {
        // console.error(error);
        return 0;
    }
}

function check1(directionalGraph) {
    var directionalGraph1 = {
        a: { b: 1, d: 1 },
        b: { a: 1, c: 1, e: 1 },
        c: { b: 1, f: 1 },
        d: { a: 1, e: 1, g: 1 },
        e: { b: 1, d: 1, f: 1, h: 1 },
        f: { c: 1, e: 1, i: 1 },
        g: { d: 1, h: 1 },
        h: { e: 1, g: 1, i: 1 },
        i: { f: 1, h: 1 }
    };
    var path = this.dijkstra.find_path(directionalGraph, 'a', 'i');
    console.log(path);
}

function check2(params) {

}

var mapPushbackNodes = function (o) {
    if (o.type === 'PushBack') {
        return o.index;
    }
}

var mapParkings = function (o) {
    if (o.type === 'parking')
        return o.index;
}

var mapParkingNode = function (o) {
    // debugger;
    if (o.type === 'parking')
        return { index: o.index, lat: o.lat, lng: o.lng, name: o.name, radius: Number(o.radius), type: o.type, parkingType: o.parkingType };
    console.debug(o);
}

var mapBoxes = function (o) {
    // debugger;
    if (o.type === 'parking')
        return { index: o.index };
}

var mapRunwayNodeId = function (o) {
    if (o.type === 'runway')
        return o.index;
    console.debug(o);
}

var mapRunwayNode = function (o) {
    if (o.type === 'runway') {
        return {index:o.index, lat: o.lat, lng: o.lng};
    }
}

var mapRunways = function (o) {
    if (o.type === 'runway_poly') {
        var pts = o.pavement[0].map(latLngToArray);
        pts.push(pts[0]);
        return turf.polygon([pts]);
    }
}

var mapEdges = function (o) {
    if (o.type === 'poly')
        // debugger;
        return {
            start: o.start, end: o.end, isPushBackRoute: o.isPushBackRoute !== undefined &&
                o.isPushBackRoute !== 0, direction: o.direction, latLngs: o.latLngs
        };
    console.debug(o);
}

var latToTurf = function (turfPoint) {
    return turf.point([turfPoint.lng, turfPoint.lat]);
};

var latLngToArray = function (turfPoint) {
    //debugger;

    return [turfPoint.lng, turfPoint.lat];
};

var turfToLatLng = function (turfPoint) {
    return '' + turfPoint.geometry.coordinates[1].toFixed(6) + ',' + turfPoint.geometry.coordinates[0].toFixed(6);
};
