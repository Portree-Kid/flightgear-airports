/*
Copyright 2021 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
*/
/* eslint-disable */
const fs = require('fs');
const path = require('path');

const store = require('../store');

const util = require('util');

const mathjs = require('mathjs');

var builder = require('xmlbuilder');

var featureLookup = [];        
var parkings = [];
var pushBackNodeLookup = [];


exports.writeTowerXML = function (fDir, icao, coordinates) {
    try {
        try { fs.mkdirSync(path.join(fDir), { recursive: true })} catch (err) { }
        try { fs.mkdirSync(path.join(fDir, icao[0]),{ recursive: true })} catch (err) { }
        try { fs.mkdirSync(path.join(fDir, icao[0], icao[1]), { recursive: true })} catch (err) { }
        try { fs.mkdirSync(path.join(fDir, icao[0], icao[1], icao[2]), { recursive: true })} catch (err) { }

        var f = path.join(fDir, icao[0], icao[1], icao[2], icao + '.twr.new.xml');
        var fBak = path.join(fDir, icao[0], icao[1], icao[2], icao + '.twr.bak.xml');

        if( fs.existsSync(f) ) {
            fs.copyFileSync(f, fBak);
        }
        if (f == null)
            return;
        var xmlObj = { PropertyList: { tower: { twr: map(coordinates)} } };

        xmlString = builder.create(xmlObj).end({ pretty: true });
        fs.writeFileSync(f, xmlString);
        console.debug(xmlString);
    } catch (error) {
        console.error(error);
    }
    return;
}

var map = function (o) {
    console.debug(o);
    /**
    <lon>-1.6286902</lon>
    <lat>59.53396633</lat>
    <elev-m>3.05</elev-m>
     */
    return { lon: o.longitude, lat: o.latitude, 'elev-m': o.height};
}