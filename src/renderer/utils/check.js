/* eslint-disable */
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/src/renderer/utils/`
    : `file://D:/GIT/flightgear-airports/src/renderer/utils/`

var path = require('path');
const fs = require('fs');

importScripts('../../../node_modules/dijkstrajs/dijkstra.js');

const homedir = require('os').homedir();

importScripts('logger.js');

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
            console.log('Crashed');
            console.log(result);
            postMessage('DONE');
        });
    }
};

async function checkGroundnet(data) {
    var promise = new Promise(function (resolve, reject) {
        this.max = 4;
        debugger;
        var parkings = data.map(mapParkings).filter(n => n !== undefined);
        var runwayNodes = data.map(mapRunwayNodes).filter(n => n !== undefined);
        var edges = data.map(mapEdges).filter(n => n !== undefined);

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
            node1[element.end] = 1;
            var node2 = graph[element.end];
            node2[element.start] = 1;
        });
        var okNodes = [];
        logger('info', graph);
        parkings.forEach(parkingNode => {
            runwayNodes.forEach(runwayNode => {
               var ok = checkRoute(graph, parkingNode, runwayNode); 
               if(ok) {
                 okNodes.push(parkingNode);
                 okNodes.push(runwayNode);
               }
               this.progress += 1;
            });
        });
        okNodes = okNodes.filter((v,i) => okNodes.indexOf(v) === i);
        var allNodes = parkings.concat(runwayNodes);
        var notOkNodes = allNodes.filter((v,i) => okNodes.indexOf(v) < 0).map(id => {return {id:id, message:'Node not connected'}});
        if (parkings.length === 0) {
            notOkNodes.push({id:0, message:'No parkings'});
        }
        if (runwayNodes.length === 0) {
            notOkNodes.push({id:0, message:'No Runwaynodes'});
        }

//        check1(graph);
//        check2();
//        this.progress += 1;
        resolve(notOkNodes);
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
