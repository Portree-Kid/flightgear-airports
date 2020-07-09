/* eslint-disable */
const convert = require('geo-coordinates-parser');
const leaflet = require('leaflet');
const turf = require('@turf/turf');
const util = require('util');
const store = require('../store');

/**
 * Cat Models                   FG Radii N2M Radii
 * B Small Regionals ERJ CRJ ATR    14       6
 * C A319 A320 A321 B737            18      10
 * D B757, B767                     26      15
 * E B777 B787 A330 A340 A360       33      24
 * F A380                           40      24
 */

 // ratchet to known radii
const validRadii = [7.5, 10, 14, 18, 26, 33, 40];

const validN2M = [5, 5, 6, 10, 15, 24, 24];

var $ = require('jquery');
L.ParkingSpot = L.Circle.extend({
    createDirection: function () {
        if (this.direction === undefined ) {
            var center = this._latlng;
            var options = { units: 'kilometers' };
            
            var start = turf.destination([center.lng, center.lat], this.options.attributes.radius / 1000, this.normalizeAngle(this.options.attributes.heading+180), options);
            var end = turf.destination([center.lng, center.lat], this.options.attributes.radius / 1000, this.normalizeAngle(this.options.attributes.heading), options);
            // Resize, since leaflet is wrong      
            var rad2 = center.distanceTo(this.turfToLatLng(end), options);
            console.debug('Dist ', center, [center.lng, center.lat], end.geometry.coordinates, this.options.attributes.radius, rad2);
            this.setRadius(rad2);
            // console.log(util.inspect(this.editor));
            if(this.editor._resizeLatLng.__vertex !== undefined){
                this.editor._resizeLatLng.__vertex.setLatLng(this.turfToLatLng(end));
            }
            this.direction = L.polyline([this.turfToLatLng(start), this.turfToLatLng(end)]);
            this.direction.addTo(this.editor.editLayer);
            this.frontWheel = L.circleMarker(center, {radius:4, weight: 2 });
            this.frontWheel.addTo(this.editor.editLayer);
            this.updateWheelPos();
            this.updateBox();
            const parkingSize = validRadii.indexOf(this.options.attributes.radius);
            if(parkingSize>=0) {
                this.setStyle({ opacity: 0, fill: false });
            }
        }
    },
    updateMiddleMarker: function() {
      if (this.editEnabled()) {
          try {
            console.debug("Update Middle ", this.editor.editLayer._layers[0]);
            var o = this.editor.editLayer._layers;
    
            console.debug(o);
            for (var key in o) {
                if (o.hasOwnProperty(key)) {
                    console.debug(key, o[key]);
                    console.debug(this.editor._resizeLatLng.__vertex==o[key]);
                    // console.debug(this.editor._resizeLatLng.__vertex._icon);
                    console.debug(o[key] == this.direction);
                    if (this.editor._resizeLatLng.__vertex!=o[key] &&
                         o[key] != this.direction &&
                         o[key] != this.frontWheel && 
                         o[key] != this.box) {
                            o[key].setLatLng(this.getLatLng());
                    }
                }
            }
            //Object.values(o);
            /*
            .forEach(vertex => {
              console.debug(this.editor._resizeLatLng.__vertex==vertex);          
            });
            */                  
          } catch (error) {
            console.error(error);
          }
      }
    },
    removeDirection() {
        this.direction = undefined;
    },
    updateHeading(heading) {
        this.options.attributes.heading = heading;
        this.updateVertexFromDirection();     
        this.updateWheelPos();       
        this.updateBox();
    },
    updateRadius(radius) {
        this._mRadius = radius;
        this.updateDirectionFromVertex();     
        this.updateVertexFromDirection();     
        this.updateWheelPos();       
        this.updateBox();
    },
    // Update the direction vertex from the direction
    updateVertexFromDirection() {
        if (this.editEnabled()) {
            var center = this._latlng;
            var options = { units: 'kilometers' };
            var start = turf.destination([center.lng, center.lat], this.options.attributes.radius / 1000, this.normalizeAngle(this.options.attributes.heading+180), options);
            var end = turf.destination([center.lng, center.lat], this.options.attributes.radius / 1000, this.normalizeAngle(this.options.attributes.heading), options);
            // Resize, since leaflet is wrong
            var rad2 = center.distanceTo(this.turfToLatLng(end), options);
            this.setRadius(rad2);
            if(this.editor._resizeLatLng.__vertex!== undefined){
                this.editor._resizeLatLng.__vertex.setLatLng(this.turfToLatLng(end));
            }
            this.direction.setLatLngs([this.turfToLatLng(start), this.turfToLatLng(end)]);
        }
    },
    // Update the direction from the moved direction vertex
    updateDirectionFromVertex() {
        if (this.editEnabled()) {
            var start = this._latlng;
            var end = this.editor._resizeLatLng.__vertex.getLatLng();
            var heading = turf.bearing([start.lng, start.lat], [end.lng, end.lat]);
            this.options.attributes.heading = heading;
            const output = validRadii.reduce((prev, curr) => Math.abs(curr - this._mRadius) < Math.abs(prev - this._mRadius) ? curr : prev);

            console.debug('Found radius ' + output);

            this._mRadius = output;
            this.options.attributes.radius = this._mRadius;
            this.direction.setLatLngs([start, end]);


        }
    },
    updateWheelPos() {
        var start = this._latlng;
        var options = { units: 'kilometers' };
        const parkingSize = validRadii.indexOf(this.options.attributes.radius);       
        if (parkingSize>=0) {
            var frontWheelEnd = turf.destination([start.lng, start.lat], validN2M[parkingSize] / 1000, this.options.attributes.heading, options);

            if(this.frontWheel!==undefined) {
                this.frontWheel.setLatLng(this.turfToLatLng(frontWheelEnd));
            }
        }     
    },
    updateBox() {
        var start = [this._latlng.lng, this._latlng.lat];
        var options = { units: 'kilometers' };
        const parkingSize = validRadii.indexOf(this.options.attributes.radius);

        var backwards = this.normalizeAngle(this.options.attributes.heading + 180);
        var left = this.normalizeAngle(this.options.attributes.heading - 90);
        var right = this.normalizeAngle(this.options.attributes.heading + 90);

        var radiusKM = this.options.attributes.radius / 1000;
        var halfRadiusKM = radiusKM/2;
        var thirdRadiusKM = radiusKM/3;

        if (parkingSize>=0) {
            var frontWheelEnd = turf.destination(start, validN2M[parkingSize] / 1000, this.options.attributes.heading, options);
            var front = turf.destination(start, radiusKM, this.options.attributes.heading, options);

            var back = turf.destination(start, radiusKM, backwards, options);

            var leftBack = turf.destination(back, radiusKM, left, options);
            var rightBack = turf.destination(back, radiusKM, right, options);

            var leftMiddle = turf.destination(start, radiusKM, left, options);
            var rightMiddle = turf.destination(start, radiusKM, right, options);

            var leftFront = turf.destination(front, thirdRadiusKM, left, options);
            var rightFront = turf.destination(front, thirdRadiusKM, right, options);

            var leftIntermediate = turf.destination(leftFront, halfRadiusKM, backwards, options);
            var rightIntermediate = turf.destination(rightFront, halfRadiusKM, backwards, options);

            if(this.box === undefined && this.editor !== undefined) {
                var latlngs = [leftBack, rightBack, rightMiddle, rightIntermediate, rightFront, leftFront, leftIntermediate, leftMiddle].map(l => this.turfToLatLng(l));
                this.box = L.polygon(latlngs);
                this.box.addTo(this.editor.editLayer);
                this.box._parkingSpot = this;    
                this.box.on('click', function (event) {
                    console.debug("Click Parking Box : " + event.target);
                    if (Number(store.default.state.Editable.index) >= 0 &&
                    event.target._parkingSpot.featureLookup !== undefined &&
                    event.target._parkingSpot.featureLookup[store.default.state.Editable.index]!==undefined) {
                        event.target._parkingSpot.featureLookup[store.default.state.Editable.index].forEach(element => {
                            if(element.deselect !== undefined) {
                                element.deselect();
                            }
                        });
                    }
                    event.target._parkingSpot.select(); 
                });        
        
            }
            if(this.box!==undefined) {
                var latlngs = [leftBack, rightBack, rightMiddle, rightIntermediate, rightFront, leftFront, leftIntermediate, leftMiddle].map(l => this.turfToLatLng(l));
                this.box.setLatLngs(latlngs);
            }
        }     
    },
    normalizeAngle( angle ) {
      if(angle >= 180) {
          return angle - 360;
      }
      if(angle <= -180) {
        return angle + 360;
      }
      return angle;
  },
    select() {
        store.default.dispatch('setParking', this.options.attributes);
        store.default.dispatch('setParkingCoords', this.getLatLng().lat.toFixed(6) + ' ' + this.getLatLng().lng.toFixed(6));
        var style = {};
        style['color'] = 'red';
        this.setStyle(style);
        if(this.direction) {
            this.direction.setStyle(style);  
            this.frontWheel.setStyle(style);
            if(this.box) {
                this.box.setStyle(style);
            }
          }
        this.updateWheelPos();
        this.updateBox();
    },    
    deselect() {
        var style = {};
        style['color'] = '#3388ff';
        this.setStyle(style);
        if(this.direction) {
            this.direction.setStyle(style);  
            this.frontWheel.setStyle(style);
            if(this.box) {
              this.box.setStyle(style);
            }
        }
        this.updateWheelPos();
        this.updateBox();
    },
    addListeners: function () {
        this.on('editable:drawing:move', function (event) {
            console.debug("Move Parking Spot: ", event);
            console.debug("Move Parking Spot : ", event.latlng);
            // Is it the edit vertex (Middle) moving?
            if(event.target.editor._resizeLatLng.__vertex._icon !== event.sourceTarget._element){
                event.target.setLatLng(event.latlng);
                event.target.updateVertexFromDirection();
                event.target.updateWheelPos();
                event.target.updateBox();
                this.follow(event.target.id, event);                        
            }
            else if(event.target.editor._resizeLatLng.__vertex._icon === event.sourceTarget._element) {
                event.target.updateDirectionFromVertex();     
                event.target.updateVertexFromDirection();     
                event.target.updateWheelPos();
                event.target.updateBox();
            }
        });
        this.on('editable:vertex:drag', function (event) { 
            console.debug("Drag Parking : ", event);
        });
        this.on('editable:vertex:dragend', function (event) {
            console.debug("DragEnd Parking : ", event);
            store.default.dispatch('setParking', event.target.options.attributes);
            store.default.dispatch('setParkingCoords', event.target.getLatLng().lat.toFixed(6) + ' ' + event.target.getLatLng().lng.toFixed(6));
            event.target.updateWheelPos();
            event.target.updateBox();
            /*
            store.default.dispatch('setParkingHeading', this.options.attributes.heading)
            store.default.dispatch('setParkingRadius', this.options.attributes.radius)
            */
        });
        this.on('click', function (event) {
            console.debug("Click Parking : " + event.target);
            if (Number(store.default.state.Editable.index) >= 0 &&
            this.featureLookup[store.default.state.Editable.index]!==undefined) {
                this.featureLookup[store.default.state.Editable.index].forEach(element => {
                    if(element.deselect !== undefined) {
                        element.deselect();
                    }
                });
            }
            event.target.select(); 
        });        
        this.on('editable:vertex:clicked', function (event) {
            console.debug(this.featureLookup[event.vertex.glueindex]);
            if (Number(store.default.state.Editable.index) >= 0 &&
            this.featureLookup[store.default.state.Editable.index]!==undefined) {
                this.featureLookup[store.default.state.Editable.index].forEach(element => {
                    if(element.deselect !== undefined) {
                        element.deselect();
                    }
                });
            }

            if(event.target.editor._resizeLatLng.__vertex._icon !== event.sourceTarget._element){
                event.vertex._icon.style['background-color'] = 'red';
                store.default.dispatch('setParking', event.target.options.attributes);
                this.select();    
            }

        });

        this.on('editable:disable', function (event) {
            event.target.removeDirection();
        });    
    },
    updateStyle: function () {

    },
    selectParking() {
        if (Number(store.default.state.Editable.index) >= 0 &&
        this.featureLookup[store.default.state.Editable.index]!==undefined) {
            this.featureLookup[store.default.state.Editable.index].forEach(element => {
                if(element.deselect !== undefined) {
                    element.deselect();
                }
            });
        }

        store.default.dispatch('setParking', this.options.attributes);
        store.default.dispatch('setParkingCoords', this.getLatLng().lat.toFixed(6) + ' ' + this.getLatLng().lng.toFixed(6));

        this.select();
    },
    turfToLatLng: function (turfPoint) {
        return {lat: turfPoint.geometry.coordinates[1], lng: turfPoint.geometry.coordinates[0]};
    },
    extensions: function (editLayer) {
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
                    element.updateWheelPos();
                    element.updateBox();
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
                    console.debug(element);
                    element.setLatLng(event.latlng);
                    element.latlngs.forEach((latlng, index) => {
                        console.debug(latlng);
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
        console.debug( '$', circle.id, key , value);
        
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