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



var writeThresholdXML = function (fDir, icao, coordinates) {
    try {
        try { fs.mkdirSync(path.join(fDir), { recursive: true })} catch (err) { }
        try { fs.mkdirSync(path.join(fDir, icao[0]),{ recursive: true })} catch (err) { }
        try { fs.mkdirSync(path.join(fDir, icao[0], icao[1]), { recursive: true })} catch (err) { }
        try { fs.mkdirSync(path.join(fDir, icao[0], icao[1], icao[2]), { recursive: true })} catch (err) { }

        var f = path.join(fDir, icao[0], icao[1], icao[2], icao + '.threshold.new.xml');
        var fBak = path.join(fDir, icao[0], icao[1], icao[2], icao + '.threshold.bak.xml');

        if( fs.existsSync(f) ) {
            fs.copyFileSync(f, fBak);
        }
        if (f == null)
            return;
        var xmlObj = { PropertyList: { runway: map(coordinates) } };

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
        <?xml version='1.0' encoding='ISO-8859-1'?>
        <PropertyList>
        <runway>
            <threshold>
                <lon>13.485025</lon>
                <lat>52.367689</lat>
                <rwy>07</rwy>
                <hdg-deg>68.75</hdg-deg>
                <displ-m>0.0</displ-m>
                <stopw-m>300.0</stopw-m>
            </threshold>
            <threshold>
                <lon>13.526097</lon>
                <lat>52.377431</lat>
                <rwy>25</rwy>
                <hdg-deg>248.78</hdg-deg>
                <displ-m>0.0</displ-m>
                <stopw-m>300.0</stopw-m>
            </threshold>
        </runway>
        <runway>
            <threshold>
                <lon>13.517142</lon>
                <lat>52.380125</lat>
                <rwy>07L</rwy>
                <hdg-deg>68.77</hdg-deg>
                <displ-m>0.0</displ-m>
                <stopw-m>160.0</stopw-m>
            </threshold>
            <threshold>
                <lon>13.554253</lon>
                <lat>52.388919</lat>
                <rwy>25R</rwy>
                <hdg-deg>248.80</hdg-deg>
                <displ-m>0.0</displ-m>
                <stopw-m>300.0</stopw-m>
            </threshold>
        </runway>
        </PropertyList>
     */
    var ret = [];
    Object.keys(o).forEach(key => {         
        ret.push({ threshold: mapThreshold(o[key])});
    });
    return ret;
}

/**
 * <latitude>58.106924</latitude>
      <longitude>6.610419</longitude>
      <index>0</index>
      <rwy>14</rwy>
      <heading>131.16</heading>
      <displacement>273</displacement>
      <stopw_m>0.0</stopw_m>

 * @param {*} t 
 */

var mapThreshold = function (t) {
    return t.map( t => {return {lon: t.longitude, lat: t.latitude, rwy: t.rwy, 'hdg-deg': t.heading, 'displ-m': t.displacement, 'stopw-m': t.stopw_m}});
}

export { writeThresholdXML };