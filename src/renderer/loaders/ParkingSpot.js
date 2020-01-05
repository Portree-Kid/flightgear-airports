/* eslint-disable */
const convert = require('geo-coordinates-parser');
const leaflet = require('leaflet');
const turf = require('@turf/turf');
const util = require('util');

var $ = require('jquery');
L.ParkingSpot = L.Circle.extend({
    createDirection: function () {
        if (this.direction === undefined ) {
            var start = this._latlng;
            var options = { units: 'kilometers' };
            
            var end = turf.destination([start.lng, start.lat], this.options.attributes.radius / 1000, this.options.attributes.heading - 180, options);
            // Resize, since leaflet is wrong      
            var rad2 = start.distanceTo(this.turfToLatLng(end), options);
            console.debug('Dist ', start, [start.lng, start.lat], end.geometry.coordinates, this.options.attributes.radius, rad2);
            this.setRadius(rad2);
            // console.log(util.inspect(this.editor));
            if(this.editor._resizeLatLng.__vertex !== undefined){
                this.editor._resizeLatLng.__vertex.setLatLng(this.turfToLatLng(end));
            }
            this.direction = L.polyline([start, this.turfToLatLng(end)]);
            this.direction.addTo(this.editor.editLayer);


            this.on('editable:drawing:move', function (event) {
                this.updateDirectionFromVertex();
            });
        }
    },
    //
    updateVertexFromDirection: function () {
        if (this.editEnabled()) {
            var start = this._latlng;
            var options = { units: 'kilometers' };
            var end = turf.destination([start.lng, start.lat], this.options.attributes.radius / 1000, this.options.attributes.heading - 180, options);
            // Resize, since leaflet is wrong
            var rad2 = start.distanceTo(this.turfToLatLng(end), options);
            this.setRadius(rad2);
            if(this.editor._resizeLatLng.__vertex!== undefined){
                this.editor._resizeLatLng.__vertex.setLatLng(this.turfToLatLng(end));
            }
            this.direction.setLatLngs([start, this.turfToLatLng(end)]);
        }
    },
    updateDirectionFromVertex: function () {
        if (this.editEnabled()) {
            var start = this._latlng;
            var end = this.editor._resizeLatLng.__vertex.getLatLng();
            var heading = turf.bearing([start.lng, start.lat], [end.lng, end.lat]);
            this.options.attributes.heading = heading + 180;
            this.direction.setLatLngs([start, end]);
        }
    },
    turfToLatLng: function (turfPoint) {
        return {lat: turfPoint.geometry.coordinates[1], lng: turfPoint.geometry.coordinates[0]};
    },
    extensions: function () {
       this.createDirection(); 
    },

    _getLatRadius: function () {
        return this._mRadius;
    },

    _getLngRadius: function () {
        return this._mRadius;
    },

});

var parkingSpot = function (n, layerGroup) {

    //console.log(n.attr('lat') + " " + n.attr('lon'));
    var latlon = convert(n.attr('lat') + " " + n.attr('lon'));
    //console.log(latlon.decimalLatitude);
    //console.log(convert(n.attr('lat') + " " + n.attr('lon')).decimalLongitude);
    const circle = new L.ParkingSpot([latlon.decimalLatitude, latlon.decimalLongitude], { radius_m: n.attr('radius'), attributes: {}  });
    circle.on('editable:enable', function (event) {
      // event.target.createDirection();
    });
    circle.id = n.attr('index');
    /*
<Parking index="2"
type="gate"
name="A6"
number=""
lat="N44 52.799"
lon="W93 11.947"
heading="-147.51"
radius="18"
pushBackRoute="541" 
airlineCodes="VIR,KAL,DAL,KLM" />
*/
    //circle.attributes = { type: n.attr('type'), name: n.attr('name'), radius: Number(n.attr('radius')), airlineCodes: n.attr('airlineCodes'), heading: Number(n.attr('heading')) };

    $.each( n.attrs, function( key, value ) {
        console.log( '$', circle.id, key , value);
        
        if(isNaN(value))
          circle.options.attributes[ key ] = value;
        else
          circle.options.attributes[ key ] = Number( value);
    }); 
    circle.addTo(layerGroup);
    return circle;
}

module.exports = parkingSpot;