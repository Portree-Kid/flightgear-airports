/* eslint-disable */
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/src/renderer/utils/`
    : `file://${process.resourcesPath}/workers/`

var path = require('path');
const fs = require('fs');

if(process.env.NODE_ENV === 'development') {
    importScripts('../../../node_modules/dijkstrajs/dijkstra.js');
} else {
    importScripts('dijkstra.js');
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

async function checkGroundnet(data) {
    var promise = new Promise(function (resolve, reject) {
        try {
            //debugger;
            var parkings = data.map(mapParkings).filter(n => n !== undefined);
            var runwayNodes = data.map(mapRunwayNodes).filter(n => n !== undefined);
            var pushbackNodes = data.map(mapPushbackNodes).filter(n => n !== undefined);
            var edges = data.map(mapEdges).filter(n => n !== undefined);
            this.max = 4 * parkings.length * runwayNodes.length +
                3 * parkings.length;
            this.postMessage(['max', this.max]);

            var graph = {};
            parkings.forEach(element => {
                graph[element] = {};
            });
            runwayNodes.forEach(element => {
                graph[element] = {};
            });
            var notOkNodes = [];

            edges.forEach(edge => {
                graph[edge.start] = {};
                graph[edge.end] = {};
                // Check if there are segments > 2km
                edge.latLngs.forEach((latLng, index, arr) => {
                    if (index>0) {
                        var d = distance([arr[index-1].lng, arr[index-1].lat], [latLng.lng, latLng.lat]);
                        if(d>2000) {
                            notOkNodes.push({ id: Number(arr[index-1].index), message: `Start of long route ${d.toFixed(2)}` });
                            notOkNodes.push({ id: Number(arr[index].index), message: `End of long route ${d.toFixed(2)}` });
                        }                        
                        //console.log(d);
                    }
                });
            });
            edges.forEach(element => {
                var node1 = graph[element.start];
                node1[Number(element.end)] = 1;
                var node2 = graph[element.end];
                node2[Number(element.start)] = 1;
            });
            // Check if there is a route from every parking to every runway node            
            var okNodes = [];
            logger('info', graph);
            parkings.forEach(parkingNode => {
                runwayNodes.forEach(runwayNode => {
                    var ok = checkRoute(graph, parkingNode, runwayNode);
                    if (ok) {
                        okNodes.push(parkingNode);
                        okNodes.push(runwayNode);
                    } else {
                        console.log(`No route from Parking ${parkingNode} to Runwaynode ${runwayNode}`);
                    }
                    this.postMessage(['progress', 1]);
                });
            });
            // Check pushback parkings
            var noPushbackGraph = {};
            parkings.forEach(element => {
                noPushbackGraph[element] = {};
            });
            pushbackNodes.forEach(element => {
                noPushbackGraph[element] = {};
            });
            edges.forEach(element => {
                noPushbackGraph[element.start] = {};
                noPushbackGraph[element.end] = {};
            });
            edges.filter(element => element.isPushBackRoute).forEach(element => {
                var node1 = noPushbackGraph[Number(element.start)];
                node1[Number(element.end)] = 1;
                var node2 = noPushbackGraph[Number(element.end)];
                node2[Number(element.start)] = 1;
            });


            var okPushbacks = [];
            parkings.forEach(parkingNode => {
                if(Object.keys(noPushbackGraph[parkingNode]).length === 0) {
                    // Not connected to a pushback must be forward push
                    okPushbacks.push(parkingNode);
                    return;
                }
                pushbackNodes.forEach(pushbackNode => {
                    var ok = checkRoute(noPushbackGraph, parkingNode, pushbackNode);
                    if (ok) {
                        okPushbacks.push(parkingNode);
                    }
                    this.postMessage(['progress', 1]);
                });
            });
            var wrongPushbackRoutes = parkings.filter(
                function (e) {
                    return this.indexOf(e) < 0;
                }
                , okPushbacks).map(
                    id => { return { id: id, message: 'No way to pushback holdpoint' } }
                );


            okNodes = okNodes.filter((v, i) => okNodes.indexOf(v) === i);
            var notOkNodesParkings = parkings.filter(
                (v, i) => okNodes.indexOf(v) < 0
            ).map(
                id => { return { id: id, message: 'No way from parking to each runway' } }
            );            
            var notOkNodesRunways = runwayNodes.filter(
                (v, i) => okNodes.indexOf(v) < 0
            ).map(
                id => { return { id: id, message: 'No way from runway to each parking' } }
            );
            
            if (parkings.length === 0) {
                notOkNodes.push({ id: 0, message: 'No parkings' });
            }
            if (runwayNodes.length === 0) {
                notOkNodes.push({ id: 0, message: 'No Runwaynodes' });
            }
            var allEnds = Object.entries(graph).filter(
                (v, i) => Object.keys(v[1]).length <= 1
            );
            // Ends that are not on Runway and not a Parking or Pushback
            var allLegitimateEndNodes = parkings.concat(runwayNodes).concat(pushbackNodes);
            var danglingEnds = allEnds.filter(
                (v, i) => allLegitimateEndNodes.indexOf(Number(v[0])) < 0
            ).map(
                v => { return { id: Number(v[0]), message: 'Node not a legimate end' } }
            );

            var parkingNodes = data.map(mapParkingNode).filter(n => n !== undefined);

            var overlappingParkings = [];
            // Check for intersecting radii
            parkingNodes.forEach(parkingNode => {
                parkingNodes.forEach(parkingNode1 => {
                    console.log(parkingNode, parkingNode1);
                    if (parkingNode.index !== parkingNode1.index) {
                        var d = distance([parkingNode.lng, parkingNode.lat],
                            [parkingNode1.lng, parkingNode1.lat]);
                        if (d < parkingNode.radius + parkingNode1.radius) {
                            overlappingParkings.push({ id: parkingNode.index, message: 'Overlapping parkings' });
                        }
                    }
                    this.postMessage(['progress', 1]);
                });
            });
            var invalidParkings = [];
            // Check for name
            parkingNodes.forEach(parkingNode => {
                if (!parkingNode.name || /^\s*$/.test(parkingNode.name)) {
                    invalidParkings.push({ id: parkingNode.index, message: 'Name empty' });
                    this.postMessage(['progress', 1]);
                }
                if (!parkingNode.type) {
                    invalidParkings.push({ id: parkingNode.index, message: 'Parking type empty' });
                    this.postMessage(['progress', 1]);
                }
                if (['ga','cargo', 'gate', 'mil-fighter', 'mil-cargo' ].indexOf(parkingNode.parkingType)<0) {
                    //debugger;
                    invalidParkings.push({ id: parkingNode.index, message: `Parking type ${parkingNode.parkingType} not valid` });
                    this.postMessage(['progress', 1]);
                }
            });
  
            //Check for dual pushback/runway nodes
            runwayNodes.forEach(runwayNode => {
                if (pushbackNodes.indexOf(runwayNode) >= 0) {
                    notOkNodes.push({ id: runwayNode, message: 'Dual runway/ pushback node' });
                }
            });

            notOkNodes = notOkNodes.concat(invalidParkings);
            if (invalidParkings.length===0) {
                notOkNodes.push({id:-1, message: 'Parkings valid'});
            }
            notOkNodes = notOkNodes.concat(overlappingParkings);
            if (overlappingParkings.length===0) {
                notOkNodes.push({id:-1, message: 'No parkings overlapping'});
            }
            notOkNodes = notOkNodes.concat(danglingEnds);
            if (danglingEnds.length===0) {
                notOkNodes.push({id:-1, message: 'No invalid ends'});
            }
            notOkNodes = notOkNodes.concat(notOkNodesParkings);
            if (notOkNodesParkings.length===0) {
                notOkNodes.push({id:-1, message: 'Routes from parkings OK'});
            }
            notOkNodes = notOkNodes.concat(notOkNodesRunways);
            if (notOkNodesRunways.length===0) {
                notOkNodes.push({id:-1, message: 'Routes from runways OK'});
            }
            notOkNodes = notOkNodes.concat(wrongPushbackRoutes);
            if (wrongPushbackRoutes.length===0) {
                notOkNodes.push({id:-1, message: 'Pushback routes OK'});
            }
            //        check1(graph);
            //        check2();
            //        this.postMessage(['progress', 1]);
            resolve(notOkNodes);

        } catch (error) {
            reject(error);
        }
    });
    return promise;
}

function checkRoute(graph, from, to) {
    try {
        var pathD = this.dijkstra.find_path(graph, from, to);
        if (pathD.length > 0) {
            console.log(pathD);
            return true;
        }
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
}

function check1(graph) {
    var graph1 = {
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
    var path = this.dijkstra.find_path(graph, 'a', 'i');
    console.log(path);
}

function check2(params) {

}

var mapPushbackNodes = function (o) {
    if (o.type === 'PushBack')
        return o.index;
    console.log(o);
}

var mapParkings = function (o) {
    if (o.type === 'parking')
        return o.index;
    console.log(o);
}

var mapParkingNode = function (o) {
    // debugger;
    if (o.type === 'parking')
        return { index: o.index, lat: o.lat, lng: o.lng, name: o.name, radius: Number(o.radius), type: o.type, parkingType: o.parkingType };
    console.log(o);
}

var mapRunwayNodes = function (o) {
    if (o.type === 'runway')
        return o.index;
    console.log(o);
}

var mapEdges = function (o) {
    if (o.type === 'poly')
        // debugger;
        return {
            start: o.start, end: o.end, isPushBackRoute: o.isPushBackRoute !== undefined &&
                o.isPushBackRoute !== 0, latLngs: o.latLngs
        };
    console.log(o);
}
