/*
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
*/

/* eslint-disable */
var L = require('leaflet');

export function checkMapper(o) {
    if (o instanceof L.ParkingSpot) {
        /*
        if( o.box === undefined ) {
          debugger;
        } */
        return {
            'index': Number(o['id']),
            '_leaflet_id': o._leaflet_id,
            'type': 'parking',
            'parkingType': o.options.attributes.type,
            'name': o.options.attributes.name,
            'radius': String(o.options.attributes.radius),
            'lat': o._latlng.lat,
            'lng': o._latlng.lng,
            'box': o.box !== undefined ? o.box.getLatLngs() : null
        };
    } else if (o instanceof L.RunwayNode) {
        console.log(o)
        
    return { 'index': Number(o['glueindex']), '_leaflet_id': o._leaflet_id, 'lat': o._latlng.lat, 'lng': o._latlng.lng, 'type': 'runway' };
    } else if (o instanceof L.HoldNode) {
        console.log(o)
        return { 'index': Number(o['glueindex']), '_leaflet_id': o._leaflet_id, 'type': o.holdPointType };
    } else if (o instanceof L.RunwayPolygon) {
        return {
            'type': 'runway_poly',
            'pavement': o.getLatLngs()
        }
    } else if (o instanceof L.Polyline) {
        console.log(o)
        //_latlngs[""0""].__vertex.glueindex
        var latLngs = o.getLatLngs().map(l => ({ lat: l.lat, lng: l.lng, index: l.glueindex }));
        if (o.options.attributes===undefined) {
          return null;
        }
        return { 'start': Number(o['begin']), 'end': Number(o['end']), '_leaflet_id': o._leaflet_id, 'type': 'poly', 'direction': o.options.attributes.direction, 'isPushBackRoute': o.options.attributes.isPushBackRoute, latLngs: latLngs };
    }
    else {
        console.log('Unknown Type ')
        console.log(typeof o)
    }
}

export function groMapper(o) {
    if (o instanceof L.Polygon) { 

    }
}
