/* eslint-disable */
const convert = require('geo-coordinates-parser');
const leaflet = require('leaflet');
const turf = require('@turf/turf');
const util = require('util');
const store = require('../store');

var $ = require('jquery');
L.Threshold = L.Circle.extend({
    highlight() {
        var style = {};
        style['color'] = 'red';
        this.setStyle(style);
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
            this.highlight(); 
            this.unwatch = store.default.watch(
                function (state) {
                        return state.Editable.data.parking;
                },
                    () => { 
                        if (event.target instanceof L.Threshold) {
                            event.target.setStyle({color : '#3388ff'}); 
                            this.unwatch();    
                        }
                    }                    
                ,
                {
                    deep: true //add this if u need to watch object properties change etc.
                }
            );
        });        
        this.on('editable:vertex:clicked', function (event) {
            console.log(this.featureLookup[event.vertex.glueindex]);
            if(event.target.editor._resizeLatLng.__vertex._icon !== event.sourceTarget._element){
                event.vertex._icon.style['background-color'] = 'red';
                store.default.dispatch('setParking', event.target.options.attributes);
                this.unwatch = store.default.watch(
                    function (state) {
                            return state.Editable.data.parking;
                    },
                        () => { 
                            event.target.setStyle({color : '#3388ff'}); 
                            this.unwatch();
                        }                    
                    ,
                    {
                        deep: true //add this if u need to watch object properties change etc.
                    }
                );
    
            }

        });

        this.on('editable:disable', function (event) {
            event.target.removeDirection();
        });    
    },
    updateStyle: function () {

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

    _getLatRadius: function () {
        return this._mRadius;
    },

    _getLngRadius: function () {
        return this._mRadius;
    },

});

var threshold = function (n, layerGroup) {
    //console.log(n.attr('lat') + " " + n.attr('lon'));
    var latlon = convert(n.find('lat/text()').text() + " " + n.find('lon/text()').text());
    //console.log(latlon.decimalLatitude);
    //console.log(convert(n.attr('lat') + " " + n.attr('lon')).decimalLongitude);
    const circle = new L.Threshold([latlon.decimalLatitude, latlon.decimalLongitude], { radius: 10, attributes: {}  });
    circle.on('editable:enable', function (event) {
      // event.target.createDirection();
    });
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

module.exports = threshold;