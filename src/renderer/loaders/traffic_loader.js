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
var xamel = require('xamel');

const store = require('../store');

const util = require('util');

exports.readTrafficXML = function (f) {
    try {
        var ret = [];
        var xmlTraffic = fs.readFileSync(f, 'utf8').toString();
        xamel.parse(xmlTraffic, function (err, xml) {
            console.debug("parsed " + path.basename(f));
            if (err !== null) {
                console.error("Error in " + airline);
                throw err;
            }

            var requiredAircraft = xml.find('trafficlist/aircraft');
            console.log("Aircraft " + requiredAircraft.length);

            ret.concat(requiredAircraft);
            var flights = xml.find('trafficlist/flight');
            console.log("Flights " + flights.length);
            ret.concat(flights);
            console.log(ret.length);
            ret = ret.concat(flights.map(flightMapper)).concat(requiredAircraft.map(aircraftMapper))
            return ret;
        });
        return ret;
    } catch (error) {
        console.error(error);
    }
};

/*
*  <flight>
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
*/

function flightMapper(params) {
    return {
        id: `${btoa(buildId(params))}`,
        callsign: params.find('callsign').text(),
        'required-aircraft': params.find('required-aircraft').text(),
        arrival: {
          port: params.find('arrival/port').text(),
          time: params.find('arrival/time').text()
        },
        departure: {
          port: params.find('departure/port').text(),
          time: params.find('departure/time').text()
        }
    };
}

function buildId(params) {
  return `${params.find('callsign').text()}_`+
  `${params.find('arrival/port').text()}_`+
  `${params.find('arrival/time').text()}_`+
  `${params.find('departure/port').text()}_` +
  `${params.find('departure/time').text()}`;
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

function aircraftMapper(params) {
    return {
        model: params.find('model').text(),
        livery: params.find('livery').text(),
        airline: params.find('airline').text(),
        'home-port': params.find('home-port').text(),
        'required-aircraft': params.find('required-aircraft').text(),
        actype: params.find('actype').text(),
        offset: params.find('offset').text(),
        radius: params.find('radius').text(),
        flighttype: params.find('flighttype').text(),
        'performance-class': params.find('performance-class').text(),
        'registration': params.find('registration').text(),
        'heavy': params.find('heavy').text(),
    };
}