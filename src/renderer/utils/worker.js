/* eslint-disable */
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/src/renderer/utils/`
    : `file://D:/GIT/flightgear-airports/src/renderer/utils/`

var scanner = importScripts(`${winURL}scan.js`);
var apt = importScripts(`${winURL}apt.js`);
var path = require('path');
const fs = require('fs');
const homedir = require('os').homedir();
var airports = importScripts(`${winURL}airports.js`);
importScripts('../txml/tXml.min.js');

function errorReceiver(event) {
    throw event.data;
}

onmessage = function (event) {
    postMessage('scanStarted');
    console.log(event.data);
    if (event.data === 'scan') {
        scanGroundnet().then(result => {
            console.log("DONE Scanning");
            postMessage('DONE', 'this');
            // event.origin.webContents.send('scanFinished');
        }
        ).catch(result => {
            console.log('Crashed');
            console.log(result);
        });
    } else if (event.data === 'scanai') {
        scanai().then(result => {
            console.log("DONE Scanning");
            postMessage('DONE');
            // event.origin.webContents.send('scanFinished');
        }
        ).catch(result => {
            console.log('Crashed');
            console.log(result);
        });
    }
    else if (event.data === 'scanapt') {
        scanAPT().then(result => {
            console.log("DONE Scanning");
            postMessage('DONE');
            // event.origin.webContents.send('scanFinished');
        }
        ).catch(result => {
            console.log('Crashed');
            console.log(result);
        });

    }
};

async function scanGroundnet() {
    var promise = new Promise(function (resolve, reject) {
        return initDB().then(features => {
            var d = path.join(homedir, '/Documents/Flightgear/main/Airports/A');
            scanGroundnetFiles(d, features);
        });
    });
    return promise;
}

function scanai() {
    return initDB().then(features => {
        scanTrafficIntoDB("C:/GIT/fgmeta/fgdata/AI/Traffic", features);
    });
}

async function scanAPT() {
    return initDB().then(features => {
        var d = path.join(homedir, 'Documents/apt.dat');
        scanAPTIntoDB(d, features);
        features.close();
        console.log("Closed DB");
    });
}


