/* eslint-disable */
const convert = require('geo-coordinates-parser');
const leaflet = require('leaflet');
const turf = require('@turf/turf');
const util = require('util');
const store = require('../store');

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
        }
    },
    updateMiddleMarker: function() {
      if (this.editEnabled()) {
          try {
            console.log("Update Middle ", this.editor.editLayer._layers[0]);
            var o = this.editor.editLayer._layers;
    
            console.log(o);
            for (var key in o) {
                if (o.hasOwnProperty(key)) {
                    console.log(key, o[key]);
                    console.log(this.editor._resizeLatLng.__vertex==o[key]);
                    // console.log(this.editor._resizeLatLng.__vertex._icon);
                    console.log(o[key] == this.direction);
                    if (this.editor._resizeLatLng.__vertex!=o[key] &&
                         o[key] != this.direction) {
                            o[key].setLatLng(this.getLatLng());
                    }
                }
            }
            //Object.values(o);
            /*
            .forEach(vertex => {
              console.log(this.editor._resizeLatLng.__vertex==vertex);          
            });
            */                  
          } catch (error) {
            console.log(error);
          }
      }
    },
    removeDirection: function () {
        this.direction = undefined;
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
            const counts = [14, 18, 26, 33, 40];

            const output = counts.reduce((prev, curr) => Math.abs(curr - this._mRadius) < Math.abs(prev - this._mRadius) ? curr : prev);

            console.log(output);
            this._mRadius = output;
            this.options.attributes.radius = this._mRadius;
            this.direction.setLatLngs([start, end]);
        }
    },
    addListeners: function () {
        this.on('editable:drawing:move', function (event) {
            console.log("Move : ", event);
            console.log("Move : ", event.latlng);
            // Is it the edit vertex (Middle) moving?
            if(event.target.editor._resizeLatLng.__vertex._icon !== event.sourceTarget._element){
                event.target.setLatLng(event.latlng);
                event.target.updateVertexFromDirection();
                this.follow(event.target.id, event);                        
            }
            else if(event.target.editor._resizeLatLng.__vertex._icon === event.sourceTarget._element) {
                event.target.updateDirectionFromVertex();     
                event.target.updateVertexFromDirection();     
            }
        });
        /*        
        this.on('editable:vertex:drag', function (event) {
            console.log("Drag : ", event);
        });
        */
        this.on('click', function (event) {
            console.log("Click : " + event.target);
            store.default.dispatch('setParking', event.target.options.attributes);
        });
        this.on('editable:vertex:clicked', function (event) {
            console.log(this.featureLookup[event.vertex.glueindex]);
            if(event.target.editor._resizeLatLng.__vertex._icon !== event.sourceTarget._element){
                event.vertex._icon.style['background-color'] = 'red';
                store.default.dispatch('setParking', event.target.options.attributes);
            }

        });

        this.on('editable:disable', function (event) {
            event.target.removeDirection();
        });    
    },
    turfToLatLng: function (turfPoint) {
        return {lat: turfPoint.geometry.coordinates[1], lng: turfPoint.geometry.coordinates[0]};
    },
    extensions: function () {
       this.createDirection(); 
       if (typeof this.featureLookup[this.id] === 'undefined') {
        this.featureLookup[this.id] = [];
       }
       this.featureLookup[this.id].push(this);
    },
      /**
       * 
       */

      follow (dragIndex, event) {
        this.featureLookup[dragIndex].forEach(element => {
            if(element !== event.target){
                if (element instanceof L.RunwayNode) {
                    element.setLatLng(event.latlng);
                }
                else if (element instanceof L.HoldNode) {
                    element.setLatLng(event.latlng);
                }
                else if (element instanceof L.ParkingSpot) {
                    // element.disableEdit();
                    element.setLatLng(event.latlng);
                    // element.enableEdit();
                    // element.extensions();
                    element.updateMiddleMarker();
                    element.updateVertexFromDirection();
                }
                else if (element instanceof L.TaxiwaySegment) {
                    if (element.begin === dragIndex) {
                        element.getLatLngs()[0].update(event.latlng);
                        element.setLatLngs(element.getLatLngs());
                        element.updateBeginVertex(event.latlng);
                        element.updateMiddle();
                    }
                    if (element.end === dragIndex) {
                        element.getLatLngs()[element.getLatLngs().length - 1].update(event.latlng);
                        element.setLatLngs(element.getLatLngs());
                        element.updateEndVertex(event.latlng);
                        element.updateMiddle();
                    }
                } else if (element instanceof L.Editable.VertexMarker) {
                    console.log(element);
                    element.setLatLng(event.latlng);
                    element.latlngs.forEach((latlng, index) => {
                        console.log(latlng);
                        if (latlng.__vertex === element) {
                            latlng.update(event.latlng);
                        }
                    });
                    element.editor.feature.setLatLngs(element.latlngs);
                    element.editor.feature.updateMiddle();
                }    
            }
        })
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
    const circle = new L.ParkingSpot([latlon.decimalLatitude, latlon.decimalLongitude], { radius: n.attr('radius'), attributes: {}  });
    circle.on('editable:enable', function (event) {
      // event.target.createDirection();
    });
    circle.id = n.attr('index');
    circle.glueindex = n.attr('index');
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
    circle.addListeners(); 
    
    circle.addTo(layerGroup);
    return circle;
}

module.exports = parkingSpot;