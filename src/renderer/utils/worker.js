/* eslint-disable */
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/src/renderer/utils/`
    : `file://${process.resourcesPath}/workers/`

var scanner = importScripts(`${winURL}scan.js`);
var apt = importScripts(`${winURL}apt.js`);
var path = require('path');
const fs = require('fs');
const homedir = require('os').homedir();
var airports = importScripts(`${winURL}airports.js`);
importScripts(`${winURL}txml/tXml.min.js`);

importScripts('logger.js');

function errorReceiver(event) {
    throw event.data;
}

onmessage = function (event) {
    postMessage('scanStarted');
    console.log(event.data);
    if (event.data[0] === 'scan') {
        loggerInit(event.data[2]);
        logger('info', 'Scan Groundnet Started');      
        scanGroundnet(event.data[1]).then(result => {
            console.log("DONE Scanning");
            postMessage('DONE');
            // event.origin.webContents.send('scanFinished');
        }
        ).catch(result => {
            console.log('Crashed');
            console.log(result);
            logger('error', 'crashed');      
            logger('error', result);      
            postMessage('DONE');
        });
    } else if (event.data[0] === 'scanai') {
        loggerInit(event.data[2]);
        logger('info', 'Scan AI Started');      
        scanai(event.data[1]).then(result => {
            console.log("DONE Scanning");
            postMessage('DONE');
            // event.origin.webContents.send('scanFinished');
        }
        ).catch(result => {
            console.log('Crashed');
            console.log(result);
            logger('error', 'crashed');      
            logger('error', result);      
            postMessage('DONE');
        });
    }
    else if (event.data[0] === 'scanapt') {
        loggerInit(event.data[2]);
        logger('info', 'Scan APT Started');      
        scanAPT(event.data[1]).then(result => {
            console.log("DONE Scanning");
            postMessage('DONE');
            // event.origin.webContents.send('scanFinished');
        }
        ).catch(result => {
            console.log('Crashed');
            console.log(result);
            logger('error', 'crashed');      
            logger('error', result);      
            postMessage('DONE');
        });

    }
};

async function scanGroundnet(fdir) {
    var promise = new Promise(function (resolve, reject) {
        return initDB().then(features => {
            var d = path.join(fdir);
            scanGroundnetFiles(d, features);
        });
    });
    return promise;
}

async function scanai(fdir) {
    var promise = new Promise(function (resolve, reject) {
        return initDB().then(features => {
            var d = path.join(fdir);
            scanTrafficFiles(d, features);
        });
    });
    return promise;
}

async function scanAPT(fdir) {
    var promise = new Promise(function (resolve, reject) {
        return initDB().then(features => {
            var d = path.join(fdir);
            scanAPTIntoDB(d, features);
        });
    });
    return promise;
}


