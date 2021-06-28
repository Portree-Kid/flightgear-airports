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

var parkingStats = (acc, cur) => {
    if (!acc[cur.radius]) {
        acc[cur.radius] = { count: 0, radius: cur.radius }
    }
    acc[cur.radius].count += 1
    return acc
};

/**
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<trafficlist xmlns:xi="http://www.w3.org/2001/XInclude"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:noNamespaceSchemaLocation="traffic.xsd">
  <aircraft>
    <model>Aircraft/BN-2/BN-2-Hebridean.xml</model>
    <livery>HBR</livery>
    <airline>HBR</airline>
    <home-port>EGEO</home-port>
    <required-aircraft>HBR_BN_2</required-aircraft>
    <actype>BN2</actype>
    <offset>0</offset>
    <radius>8</radius>
    <flighttype>gate</flighttype>
    <performance-class>turboprop_transport</performance-class>
    <registration>G-HEBS</registration>
    <heavy>false</heavy>
  </aircraft>
  <flight>
    <callsign>Hebridean_1047</callsign>
    <required-aircraft>HBR_BN_2</required-aircraft>
    <fltrules>VFR</fltrules>
    <departure>
      <port>EGPU</port>
      <time>4/14:50:00</time>
    </departure>
    <cruise-alt>50</cruise-alt>
    <arrival>
      <port>EGEO</port>
      <time>4/15:50:00</time>
    </arrival>
    <repeat>WEEK</repeat>
  </flight>
</trafficlist>
     */

var writeTrafficXML = function (fDir, parkings, aircraft) {
    try {
        var icao = store.default.state.Airports.currentAirport.icao;
        var aircraftList = aircraft;

        try { fs.mkdirSync(path.join(fDir), { recursive: true }) } catch (err) { }
        try { fs.mkdirSync(path.join(fDir, 'TST'), { recursive: true }) } catch (err) { }

        var f = path.join(fDir, 'TST', icao + '.xml');


        var parkingData = parkings.reduce(parkingStats, {});

        /*
        *
        <flight>
            <callsign>Hebridean_1001</callsign>
            <required-aircraft>HBR_BN_2</required-aircraft>
            <fltrules>VFR</fltrules>
            <departure>
            <port>EGEO</port>
            <time>2/14:10:00</time>
            </departure>
            <cruise-alt>50</cruise-alt>
            <arrival>
            <port>EGEY</port>
            <time>2/15:20:00</time>
            </arrival>
            <repeat>WEEK</repeat>
        </flight>
        */

        var flightMapper = function (pStat) {
            var ret = [];
            var blockSize = Math.min( pStat[1].count/6, 6);
            for (let index = 0; index < pStat[1].count; index++) {
                var aircraft = this[index];
                var minutes = `${Math.floor(index/blockSize)}`.padStart(2, '0');
                var seconds = `${index}`.padStart(2, '0');
                for (let weekday = 0; weekday < 7; weekday++) {
                    ret.push({
                        callsign: `Test_${index}_${weekday}`,
                        'required-aircraft': aircraft['required-aircraft'],
                        fltrules: 'VFR',
                        departure: {
                            port: icao,
                            time: `${weekday}/12:${minutes}:${seconds}`
                        },
                        'cruise-alt': 50,
                        arrival: {
                            port: icao,
                            time: `${weekday}/13:${minutes}:${seconds}`
                        },
                        repeat: 'WEEK'
                    });
                    }
            }
            return ret;
        }

        /*
        <aircraft>
            <model>Aircraft/BN-2/BN-2-Hebridean.xml</model>
            <livery>HBR</livery>
            <airline>HBR</airline>
            <home-port>EGEO</home-port>
            <required-aircraft>HBR_BN_2</required-aircraft>
            <actype>BN2</actype>
            <offset>0</offset>
            <radius>8</radius>
            <flighttype>gate</flighttype>
            <performance-class>turboprop_transport</performance-class>
            <registration>G-HEBO</registration>
            <heavy>false</heavy>
        </aircraft>

        */
        var aircraftMapper = function (pStat) {
            var ret = [];
            if (typeof this === 'undefined') {
                return;
            }
            var possibleAircraft = this.filter(a => a.radius <= pStat[1].radius);

            for (let index = 0; index < pStat[1].count; index++) {
                var aircraft = possibleAircraft[Math.floor(Math.random() * possibleAircraft.length)];
                aircraft['required-aircraft'] = `GG-${index}`;
                aircraft.registration = `GG-${index}`;
                aircraft['home-port'] = icao;
                ret.push(aircraft);
            }
            return ret;
        }


        var aircraftList = Object.entries(parkingData).flatMap(aircraftMapper, aircraft).sort();
        var flightList = Object.entries(parkingData).flatMap(flightMapper, aircraftList).sort();

        var xmlObj = { trafficList: { aircraft: aircraftList, flight: flightList } };

        var xmlString = builder.create(xmlObj).end({ pretty: true });
        fs.writeFileSync(f, xmlString);
        console.debug(xmlString);
    } catch (error) {
        console.error(error);
    }
    return;
}


export { writeTrafficXML as writeTrafficXML };