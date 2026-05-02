/* eslint-disable */
const fs = require('fs');
const path = require('path');
const xamel = require('xamel');
const convert = require('geo-coordinates-parser');
const LatLonEllipsoidal = require('geodesy/latlon-ellipsoidal-vincenty.js').default;

const store = require('../store');

const util = require('util');

var $ = require('jquery');

console.log("Procedures Loader");


exports.writeProceduresXML = function (fDir, icao, runways) {
    try {
     } catch (error) {  console.error(error); }
};

exports.readProceduresXML = function (fDir, icao, force, stripes) {
    store.default.dispatch('setProceduresLoaded', false);
    if (icao == null) {
        return;
    }

    try {
        var layerGroup = L.layerGroup();
        layerGroup.maxId = 0;
        var f = path.join(fDir, icao[0], icao[1], icao[2], icao + '.procedures.xml');
        var fNew = path.join(fDir, icao[0], icao[1], icao[2], icao + '.procedures.new.xml');

        if (f == null || !fs.existsSync(f))
            return;
        if (fNew != null && fs.existsSync(fNew) && !force) {
            f = fNew;
        }

        var features = new Array();

        //        map.on("editable:vertex:new", function (event) {
        //            log.console("Add vertex " + event);
        //        });

        console.debug("parsing " + path.basename(f));
        var xmlProcedures = fs.readFileSync(f, 'utf8').toString();
        xamel.parse(xmlProcedures, function (err, xml) {
            console.debug("parsed " + path.basename(f));
            if (err !== null) {
                console.error("Error in " + airline);
                throw err;
            }

            var procedureNodes = xml.find('ProceduresDB/Airport/node()');
            console.log("Procedure Nodes" + procedureNodes.length);

            var procedures = [];
            var index = 0;
            procedureNodes.map(r => {
                console.log(r.name + " " + r.get("Name"));
                procedures.push({type: r.name, name: r.attrs["Name"], runways: r.attrs["Runways"]});
            }).sort();
            store.default.dispatch('setProcedures', procedures);
            return procedures;
        });
        //                  var jsonAirports = JSON.parse(geoJSON);
        //        return jsonAirports;
    } catch (error) {
        console.error(error);
    }
    store.default.dispatch('setProceduresLoaded', true);
    return layerGroup;
};

exports.readProcedureXML = function (fDir, icao, type, name) {
    store.default.dispatch('setProceduresLoaded', false);
    if (icao == null) {
        return;
    }

    try {
        var layerGroup = L.layerGroup();
        layerGroup.maxId = 0;
        var f = path.join(fDir, icao[0], icao[1], icao[2], icao + '.procedures.xml');
        var fNew = path.join(fDir, icao[0], icao[1], icao[2], icao + '.procedures.new.xml');

        if (f == null || !fs.existsSync(f))
            return;
        if (fNew != null && fs.existsSync(fNew) && !force) {
            f = fNew;
        }

        var features = new Array();

        //        map.on("editable:vertex:new", function (event) {
        //            log.console("Add vertex " + event);
        //        });

        console.debug("parsing " + path.basename(f));
        var xmlProcedures = fs.readFileSync(f, 'utf8').toString();
        xamel.parse(xmlProcedures, function (err, xml) {
            console.debug("parsed " + path.basename(f));
            if (err !== null) {
                console.error("Error in " + airline);
                throw err;
            }

            var procedureNodes = xml.find('ProceduresDB/Airport/node()');
            console.log("Procedure Nodes" + procedureNodes.length);

            var index = 0;
            procedureNodes.map(r => {
                /*
                KLAX-25L, SMO02, LAX, SLI, SLI, SEBBY, DAG
                */
                if (r.name == type && r.attrs["Name"] == name) {
                    console.log(r.name + " " + r.get("Name"));
                    var points = procedureNodes.find('*/*/Latitude');
                    points.map(p => {
                        layerGroup.addLayer(new L.Marker([Number(p.parent.find("Latitude").text()), Number(p.parent.find("Longitude").text())]));
                    });
                }
            }).sort();
            return layerGroup;
        });
        //                  var jsonAirports = JSON.parse(geoJSON);
        //        return jsonAirports;
    } catch (error) {
        console.error(error);
    }
    store.default.dispatch('setProceduresLoaded', true);
    return layerGroup;
};