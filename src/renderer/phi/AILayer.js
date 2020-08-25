/* eslint-disable */
const $ = require('jquery');

const aiAircraftMarker = require('./AircraftMarker').default;

var aiLayerLookup = {};

/**http://wiki.openstreetmap.org/wiki/Zoom_levels*/

var metersPerPixel = function (latitude, zoomLevel) {
    var earthCircumference = 40075017;
    var latitudeRadians = latitude * (Math.PI / 180);
    return earthCircumference * Math.cos(latitudeRadians) / Math.pow(2, zoomLevel + 8);
};

var pixelValue = function (latitude, meters, zoomLevel) {
    return meters / metersPerPixel(latitude, zoomLevel);
};

function mapSGPropertyNode(node) {
    var o = {};
    node.children.forEach(child => {
        if (child.nChildren > 0) {
            o[child['name']] = mapSGPropertyNode(child);
        } else {
            switch (child.type) {
                case "string":
                    o[child['name']] = child.value;
                    break;
                case "bool":
                    o[child['name']] = Boolean(child.value);
                    break;
                case "double":
                case "int":
                    o[child['name']] = child.value;
                    break;
                default:
                    break;
            }
        }
    });
    o.name = node.name;
    o.index = node.index;
    o.path = node.path;
    return o;
}

(function (factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'knockout', 'leaflet', 'props'
        ], factory);
    } else {
        // Browser globals
        factory();
    }
}(function (ko, leaflet, SGPropertyNode) {

    var AITypeToCssClassMap = {
        aircraft: "ai-aircraft-marker-icon",
        multiplayer: "mp-aircraft-marker-icon"
    }

    function formatFL(num) {
        return "F" + ("000" + (num / 100).toFixed(0)).substr(-3, 3);
    }

    function ViewModel(h, l) {
        var self = this;

        self.heading = h;
        self.labelLines = l;
    }

    L.AILayer = L.GeoJSON.extend({
        options: {
            pointToLayer: function (feature, latlng) {
                var options = {
                    title: feature.properties.callsign,
                    alt: feature.properties.callsign,
                    riseOnHover: true,
                    draggable: true,
                };

                var aiMarker = null;

                if (feature.properties.type == "aircraft") {
                    if (aiLayerLookup[feature.id] === undefined) {
                        aiMarker = aiAircraftMarker(latlng, feature.properties);
                        aiMarker.on('add', function (e) {
                        });
                        aiMarker.options.draggable = true;
                        //We can't drag multiplayer 
                        if (feature.properties.type == "aircraft") {
                            aiMarker.on('dragstart', function (evt) {
                                evt.target.isDragging = true;
                            });

                            aiMarker.on('dragend', function (evt) {
                                if (evt.target !== this)
                                    return;
                                var pos = evt.target.getLatLng();

                                var props = {
                                    name: "position",
                                    children: [
                                        {
                                            name: "latitude-deg",
                                            value: pos.lat,
                                        }, {
                                            name: "longitude-deg",
                                            value: pos.lng,
                                        },
                                    ],
                                };
                                $.post("json" + feature.properties.path, JSON.stringify(props));
                                evt.target.isDragging = false;
                            });
                        }
                        aiLayerLookup[feature.id] = aiMarker;
                        return aiMarker;
                    } else {
                        var aiMarker = aiLayerLookup[feature.id];
                        aiMarker.setLatLng({lat: feature.geometry.coordinates[1], 
                            lng: feature.geometry.coordinates[0]});
                        aiMarker.updateProperties(feature.properties);
                        return aiMarker;
                    }

                }
            },

            //            onEachFeature : function(feature, layer) {
            //            },
        },

        onAdd: function (map) {
            L.GeoJSON.prototype.onAdd.call(this, map);
            this.update(++this.updateId);
        },

        onRemove: function (map) {
            this.updateId++;
            L.GeoJSON.prototype.onRemove.call(this, map);
        },

        stop: function () {
            this.updateId++;
        },

        // Refresh method called every 10s to reload other aircraft
        updateId: 0,
        update: function (id) {
            var self = this;

            if (self.updateId != id)
                return;

            var url = this.options.url + "/json/ai/models?d=99";
            var jqxhr = $.get(url).done(function (data) {
                try {
                    self.clearLayers();
                    self.addData(self.aiPropsToGeoJson(data, [
                        "aircraft", "multiplayer", "carrier"
                    ], self._map.getBounds()));
                } catch (error) {
                    console.error(error);

                }
            }).fail(function (a, b) {
                self.updateId++;
                // alert('failed to load AI data');
            }).always(function () {
            });

            if (self.updateId == id) {
                setTimeout(function () {
                    self.update(id)
                }, 10000);
            }
        },

        // Builds the GeoJSON representation of AI, Multiplayer and Carriers
        aiPropsToGeoJson: function (props, types, bounds) {
            var geoJSON = {
                type: "FeatureCollection",
                features: [],
            };


            types.forEach(function (type) {
                props.children.filter(childObject => childObject.path.includes(type))
                    .map(mapSGPropertyNode)
                    .forEach(function (child) {

                        if (!child["valid"])
                            return;

                        var path = child.path;
                        var position = child.position;
                        var orientation = child.orientation;
                        var velocities = child.velocities;
                        var lon = position["longitude-deg"];
                        var lat = position["latitude-deg"];
                        if (false == bounds.contains(L.latLng(lat, lon))) {
                            return;
                        }
                        var alt = position["altitude-ft"];
                        var heading = orientation["true-heading-deg"];
                        var id = child.id;
                        var callsign = "";
                        var name = "";
                        var speed = 0;
                        var departureAirportId = "";
                        var arrivalAirportId = "";
                        if (type == "multiplayer") {
                            name = child["sim"]["model"]["path"];
                        }
                        if (type == "carrier") {
                            callsign = child["sign"];
                            name = child["name"];
                            speed = velocities["speed-kts"];
                        } else {
                            callsign = child["callsign"];
                            speed = velocities["true-airspeed-kt"];
                            departureAirportId = child["departure-airport-id"];
                            arrivalAirportId = child["arrival-airport-id"];
                        }

                        geoJSON.features.push({
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [
                                    lon, lat, alt.toFixed(0)
                                ],
                            },
                            "id": id,
                            "properties": {
                                "path": path,
                                "type": type,
                                "heading": heading.toFixed(0),
                                "speed": speed.toFixed(0),
                                "callsign": callsign,
                                "name": name,
                                "departureAirportId": departureAirportId,
                                "arrivalAirportId": arrivalAirportId,
                            },
                        });

                    });
            });

            return geoJSON;
        },

    });

    L.aiLayer = function (options) {
        return new L.AILayer(null, options);
    }

}));

export function aiLayer(options) {
    return undefined //new L.AILayer(null, options);
}
