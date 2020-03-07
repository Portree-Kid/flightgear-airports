/* eslint-disable */
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/src/renderer/utils/`
    : `file://D:/GIT/flightgear-airports/src/renderer/utils/`

var path = require('path');
const fs = require('fs');

importScripts('../../../node_modules/dijkstrajs/dijkstra.js');

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
            postMessage('DONE');
        });
    }
};

async function checkGroundnet(data) {
    var promise = new Promise(function (resolve, reject) {
        try {
//            debugger;
            var parkings = data.map(mapParkings).filter(n => n !== undefined);
            var runwayNodes = data.map(mapRunwayNodes).filter(n => n !== undefined);
            var edges = data.map(mapEdges).filter(n => n !== undefined);
            this.max = parkings.length * runwayNodes.length + 
            parkings.length;
            this.postMessage(['max', this.max]);

            var graph = {};
            parkings.forEach(element => {
                graph[element] = {};
            });
            runwayNodes.forEach(element => {
                graph[element] = {};
            });
            edges.forEach(element => {
                graph[element.start] = {};
                graph[element.end] = {};
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
                   if(ok) {
                     okNodes.push(parkingNode);
                     okNodes.push(runwayNode);
                   }
                   this.postMessage(['progress', 1]);
                });
            });
            okNodes = okNodes.filter((v,i) => okNodes.indexOf(v) === i);
            var allLegitimateEndNodes = parkings.concat(runwayNodes);
            var notOkNodes = allLegitimateEndNodes.filter(
                (v,i) => okNodes.indexOf(v) < 0
                ).map(
                    id => {return {id:id, message:'Node not connected'}}
                    );
            if (parkings.length === 0) {
                notOkNodes.push({id:0, message:'No parkings'});
            }
            if (runwayNodes.length === 0) {
                notOkNodes.push({id:0, message:'No Runwaynodes'});
            }
            // Ends that are not on Runway and not a Parking
            var danglingEnds = Object.entries(graph).filter(
                (v,i) => Object.keys(v[1]).length <= 1
                ).filter(
                    (v,i) => allLegitimateEndNodes.indexOf(Number(v[0])) < 0
                    ).map(
                        v => {return {id:Number(v[0]), message:'Node not a legimate end'}}
                        );
            notOkNodes = notOkNodes.concat(danglingEnds);

            var parkingNodes = data.map(mapParkingNode).filter(n => n !== undefined);

            // Check for intersecting radii
            parkingNodes.forEach(parkingNode => {
                parkingNodes.forEach( parkingNode1 => {
                    console.log(parkingNode, parkingNode1);
                    if(parkingNode.index !== parkingNode1.index) {
                        var d = distance([parkingNode.lng, parkingNode.lat], 
                          [parkingNode1.lng, parkingNode1.lat]);
                        if (d < parkingNode.radius + parkingNode1.radius) {
                            notOkNodes.push({id: parkingNode.index, message:'Intersecting node'});
                        }
                    }
                    this.postMessage(['progress', 1]);
                });
            });
    
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
        if (pathD.length>0) {
            console.log(pathD);        
        }
        return true;            
    } catch (error) {
        console.log('No route from ' + from + ' to ' + to);
        return false;
    }
}

function check1(graph) {
    var graph1 = {
        a: {b: 1, d: 1},
        b: {a: 1, c: 1, e: 1},
        c: {b: 1, f: 1},
        d: {a: 1, e: 1, g: 1},
        e: {b: 1, d: 1, f: 1, h: 1},
        f: {c: 1, e: 1, i: 1},
        g: {d: 1, h: 1},
        h: {e: 1, g: 1, i: 1},
        i: {f: 1, h: 1}
    };
    var path = this.dijkstra.find_path(graph, 'a', 'i');
    console.log(path);
}

function check2(params) {
    
}

var mapParkings = function (o) {
    if(o.type === 'parking')
      return o.index;
    console.log(o);
}

var mapParkingNode = function (o) {
    if(o.type === 'parking')
      return {index: o.index, lat:o.lat, lng:o.lng, radius: Number(o.radius)};
    console.log(o);
}

var mapRunwayNodes = function (o) {
    if(o.type === 'runway')
      return o.index;
    console.log(o);
}

var mapEdges = function (o) {
    if(o.type === 'poly')
      return {start: o.start, end: o.end};
    console.log(o);
}
