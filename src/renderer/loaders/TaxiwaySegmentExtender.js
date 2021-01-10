/* eslint-disable */
const Vue = require('vue');

var L = require('leaflet');
const store = require('../store');
const util = require('util');
const assign = require('core-js/fn/object/assign');

const extendTaxiSegment = function (taxiwaySegment) {
    taxiwaySegment.__proto__.begin;
    taxiwaySegment.__proto__.end;
    taxiwaySegment.__proto__.bidirectional;
    taxiwaySegment.__proto__.updateBeginVertex = function (latlng) {
        if (this._latlngs[0].__vertex) {
            this._latlngs[0].__vertex.setLatLng(latlng);
            this.selectVertex(Number(this._latlngs[0].glueindex));
        }
    };
    taxiwaySegment.__proto__.updateEndVertex = function (latlng) {
        if (this._latlngs[1].__vertex) {
            this._latlngs[1].__vertex.setLatLng(latlng);
            this.selectVertex(Number(this._latlngs[1].glueindex));
        }
    };

    taxiwaySegment.__proto__.updateMiddle = function () {
        this._latlngs.forEach(element => {
            if (element.__vertex && element.__vertex.middleMarker) {
                element.__vertex.middleMarker.updateLatLng();
            }
        });
    };
    taxiwaySegment.__proto__.setEditlayer = function (editLayer) {
        this.editLayer = editLayer;
    };
    taxiwaySegment.__proto__.extensions = function (editLayer) {
        this.editLayer = editLayer;
        this._latlngs[0].glueindex = this.begin;
        this._latlngs.slice(-1)[0].glueindex = this.end;
        if (this.featureLookup) {
            if (typeof this.featureLookup[this.begin] === 'undefined') {
                this.featureLookup[this.begin] = new Array();
            }
            if (typeof this.featureLookup[this.end] === 'undefined') {
                this.featureLookup[this.end] = new Array();
            }
            this.featureLookup[this.begin].push(this);
            this.featureLookup[this.end].push(this);
            this.bidirectional = true;
        }
    };
    taxiwaySegment.__proto__.select = function () {
        this.options.attributes.selected = true;
        this.updateStyle();
    };
    taxiwaySegment.__proto__.selectVertex = function (index) {
        this.getLatLngs().forEach(element => {
            if (Number(element.glueindex) === index) {
                if (element.__vertex._icon != null) {
                    element.__vertex.__proto__.deselect = function () {
                        if (this._icon != null) {
                            this._icon.style.setProperty('background-color', 'white');
                            this._icon.style.setProperty('color', 'white');
                        } else if (this.icon != null) {
                            if (this.icon.style != null) {
                                this.icon.style['background-color'] = 'white';
                            } else {
                                this.setStyle({ color: 'white' })
                            }
                        } else if (this.options.icon != null) {
                            if (this.options.icon.style != null) {
                                this.options.icon.style['background-color'] = 'white';
                            } else {
                                this.options.icon._setIconStyles({ color: 'white' })
                            }
                        }
                    }
                    element.__vertex._icon.style.setProperty('background-color', 'red');
                    element.__vertex._icon.style.setProperty('color', 'red');
                } else if (element.__vertex !== undefined && element.__vertex.icon != null) {
                    if (element.__vertex.icon.style != null) {
                        element.__vertex.icon.style['background-color'] = 'red';
                    } else {
                        element.__vertex.setStyle({ color: 'red' })
                    }
                } else if (element.__vertex.options.icon != null) {
                    if (element.__vertex.options.icon.style != null) {
                        element.__vertex.options.icon.style['background-color'] = 'red';
                    } else {
                        element.__vertex.options.icon._setIconStyles({ color: 'red' })
                    }
                }
            }
        });
    };
    taxiwaySegment.__proto__.deselect = function () {
        this.options.attributes.selected = false;
        this.updateStyle();
        this.getLatLngs().forEach(element => {
            if (element.__vertex !== undefined) {
                if (element.__vertex._icon != null) {
                    element.__vertex._icon.style['background-color'] = 'white';
                } else if (element.__vertex.icon != null) {
                    if (element.__vertex.icon.style != null) {
                        element.__vertex.icon.style['background-color'] = 'white';
                    } else {
                        element.__vertex.setStyle({ color: 'white' })
                    }
                } else if (element.__vertex.options.icon != null) {
                    if (element.__vertex.options.icon.style != null) {
                        element.__vertex.options.icon.style['background-color'] = 'white';
                    } else {
                        element.__vertex.options.icon._setIconStyles({ color: 'white' })
                    }
                }
            }
        });
    };
    taxiwaySegment.__proto__.addListeners = function () {
        this.on('click', function (event) {
            if (Number(store.default.state.Editable.index) >= 0 &&
                this.featureLookup[store.default.state.Editable.index] !== undefined) {
                this.featureLookup[store.default.state.Editable.index].forEach(element => {
                    element.deselect();
                });
            }
            event.target.select();
            console.debug("Click : " + util.inspect(event.originalEvent));
            if (!event.originalEvent.ctrlKey) {
                if (store.default.state.Editable.data.arc === undefined ||
                    store.default.state.Editable.data.arc !== event.target.options.attributes) {
                    if (event.target.options.attributes === undefined) {
                        event.target.options.attributes = {};
                    }
                    event.target.options.attributes.index = event.target._leaflet_id;

                    this.editLayer.featureLookup[event.target._leaflet_id] = [];
                    this.featureLookup[event.target._leaflet_id].push(this);
                    event.target.options.attributes.selected = true;
                    store.default.dispatch('setArc', event.target.options.attributes);
                }
            } else {
                var arcs = event.target.expandArc(event.target.options.attributes);
                var multiarc = { name: '', index: 900719925474099, ids: [], isPushBackRoute: null, direction: null };
                if (store.default.state.Editable.data.multiarc === undefined ||
                    store.default.state.Editable.data.multiarc !== event.target.options.attributes) {
                    if (event.target.options.attributes === undefined) {
                        event.target.options.attributes = {};
                    }
                    event.target.options.attributes.index = event.target._leaflet_id;

                    this.editLayer.featureLookup[event.target._leaflet_id] = [];
                    this.featureLookup[event.target._leaflet_id].push(this);
                    event.target.options.attributes.selected = true;

                    //multiarc.name = JSON.parse(JSON.stringify(event.target.options.attributes.name));
                    //multiarc.isPushBackRoute = JSON.parse(JSON.stringify(event.target.options.attributes.isPushBackRoute));
                    //multiarc.direction = JSON.parse(JSON.stringify(event.target.options.attributes.direction));
                    if (event.target.options.attributes.name !== undefined) {
                        multiarc.name = assign(event.target.options.attributes.name);
                    }
                    multiarc.isPushBackRoute = assign(event.target.options.attributes.isPushBackRoute);
                    multiarc.direction = assign(event.target.options.attributes.direction);

                    this.editLayer.featureLookup[900719925474099] = [];

                    multiarc.ids = [];

                    //TODO
                    store.default.dispatch('setMultiArc', multiarc);
                }
                var editLayer = this.editLayer;
                arcs.forEach(id => {
                    console.debug(id);
                    var arc = editLayer.groundnetLayerGroup.getLayer(id);
                    if (arc && arc instanceof L.Polyline) {
                        editLayer.featureLookup[900719925474099].push(arc);
                        arc.select();
                    }
                });
                store.default.dispatch('setMultiArcIds', arcs);
            }
        });
        this.on('editable:drawing:move', function (event) {
            if (dragIndex >= 0) {
                this.selectVertex(dragIndex);
                console.log('GlueDrag : ' + dragIndex + '\t' + event.target.dragIndex);
                this.follow(dragIndex, event);
            }
        });
        this.on('editable:middlemarker:mousedown', event => {
            console.debug('editable:middlemarker:mousedown');
        }),
            this.on('editable:vertex:new', event => {
                console.debug('editable:vertex:new ' + event.vertex.getIndex() + '\t' + event.vertex.getLastIndex() + '\t');
                // Find nearest node
                let closest = this.editLayer.closestLayerSnap(event.latlng, 5)
                let taxiwaySegment = event.vertex.editor.feature;
                if (taxiwaySegment.options.attributes === undefined) {
                    taxiwaySegment.options.attributes = { direction: 'bi-directional' };
                }
                taxiwaySegment.updateStyle();
                if (event.vertex.getIndex() !== 0 && event.vertex.getIndex() !== event.vertex.getLastIndex()) {
                    var x = taxiwaySegment.getLatLngs().filter(l => l === event.vertex.latlng);
                    // Somehow the latlng is not in our Segment!?
                    if (taxiwaySegment.getLatLngs().length < 3 && x.length === 0) {
                        var fixed = taxiwaySegment.getLatLngs();
                        fixed.splice(1, 0, event.vertex.latlng);
                        taxiwaySegment.setLatLngs(fixed);
                    }
                    var nextIndex = ++taxiwaySegment.editLayer.groundnetLayerGroup.maxId;
                    var splitOffNodes = taxiwaySegment.getLatLngs().splice(-1);
                    var remainingNodes = taxiwaySegment.getLatLngs();
                    if (remainingNodes.length <= 1 || !remainingNodes[1]) {
                        console.error(remainingNodes);
                    }
                    splitOffNodes.unshift(L.latLng(remainingNodes[1].lat, remainingNodes[1].lng, remainingNodes[1].alt));
                    remainingNodes[1]['glueindex'] = nextIndex;
                    remainingNodes[1].attributes = { index: nextIndex, isOnRunway: 0 };
                    taxiwaySegment.options.attributes.end = nextIndex;
                    splitOffNodes[0]['glueindex'] = nextIndex;
                    splitOffNodes[0].attributes = { index: nextIndex, isOnRunway: 0 };
                    taxiwaySegment.setLatLngs(remainingNodes);
                    //taxiwaySegment.editor.refresh();
                    //taxiwaySegment.editor.reset();
                    if (splitOffNodes.length > 1) {
                        var polyline = new L.Polyline(splitOffNodes, { attributes: {} });
                        polyline.addTo(taxiwaySegment.editLayer.$parent.$parent.$refs.map.mapObject);
                        polyline.addTo(taxiwaySegment.editLayer.groundnetLayerGroup);
                        extendTaxiSegment(polyline);
                        polyline.addListeners();
                        polyline.setEditlayer(taxiwaySegment.editLayer);
                        polyline.enableEdit(taxiwaySegment.editLayer.$parent.$parent.$refs.map.mapObject);
                        polyline.editor.refresh();
                        //polyline.editor.reset();
                        polyline.featureLookup = this.featureLookup;
                        polyline.options.attributes.name = taxiwaySegment.options.attributes.name;
                        polyline.options.attributes.direction = taxiwaySegment.options.attributes.direction;
                        polyline.options.attributes.isPushBackRoute = taxiwaySegment.options.attributes.isPushBackRoute;
                        polyline.options.attributes.begin = nextIndex;
                        polyline.options.attributes.end = taxiwaySegment.end;
                        polyline.updateStyle();
                        polyline.begin = nextIndex;
                        polyline.end = taxiwaySegment.end;
                        taxiwaySegment.end = nextIndex;
                        this.editLayer.featureLookup[nextIndex] = [];
                        this.featureLookup[nextIndex].push(taxiwaySegment);
                        this.featureLookup[nextIndex].push(polyline);
                    } else {
                        console.error('SplitoffNodes Short ', splitOffNodes);
                    }
                } else {
                    // Glue to another node
                    if (closest) {
                        event.latlng['glueindex'] = Number(closest.glueindex);
                        event.latlng.__vertex.setLatLng(closest.latlng);
                        event.latlng.attributes = { index: event.latlng.glueindex, isOnRunway: 0 };
                        // Push Vertex to lookup
                        this.editLayer.featureLookup[event.latlng.glueindex].push(event.latlng.__vertex);
                        if (taxiwaySegment.options.attributes.begin === undefined) {
                            taxiwaySegment.options.attributes.begin = event.latlng['glueindex']
                        } else {
                            taxiwaySegment.options.attributes.end = event.latlng['glueindex']
                        }
                        if (taxiwaySegment.getLatLngs().length === 1) {
                            taxiwaySegment.begin = closest.glueindex;
                        }
                        taxiwaySegment.end = closest.glueindex;
                        console.debug(`Closest : ${closest}`)
                    } else {
                        event.vertex.latlng['glueindex'] = ++this.editLayer.groundnetLayerGroup.maxId;
                        event.vertex.latlng.attributes = { index: event.vertex.latlng.glueindex, isOnRunway: 0 };
                        this.editLayer.featureLookup[event.vertex.latlng.glueindex] = [];
                        this.editLayer.featureLookup[event.vertex.latlng.glueindex].push(event.vertex);
                        this.editLayer.featureLookup[event.vertex.latlng.glueindex].push(taxiwaySegment);
                        // taxiwaySegment.editor.refresh();
                        //taxiwaySegment.editor.reset();
                        if (taxiwaySegment.options.attributes.begin === undefined) {
                            taxiwaySegment.options.attributes.begin = event.vertex.latlng['glueindex']
                            taxiwaySegment.begin = event.vertex.latlng.glueindex;
                        } else if (taxiwaySegment.options.attributes.end === undefined ||
                            (taxiwaySegment.getLatLngs()[taxiwaySegment.getLatLngs().length - 1].glueindex &&
                                Number(taxiwaySegment.getLatLngs()[taxiwaySegment.getLatLngs().length - 1].glueindex) !== taxiwaySegment.options.attributes.end)) {
                            taxiwaySegment.options.attributes.end = event.vertex.latlng['glueindex']
                            taxiwaySegment.end = Number(event.vertex.latlng.glueindex);
                        }
                    }
                }
                //this.splitShape(taxiwaySegment.getLatLngs(), )
            });
        this.on('editable:vertex:deleted', event => {
            console.debug('editable:vertex:deleted')
        });
        this.on('editable:vertex:mousedown', event => {
            console.debug('editable:vertex:mousedown')
            event.layer.editor.map.fire('mousedown', event);
        });
        this.on('editable:vertex:click', event => {
            console.debug('editable:vertex:click')
        });
        this.on('editable:vertex:rawclick', event => {
            console.debug('editable:vertex:rawclick')
            event.cancel()
        });
        this.on('editable:vertex:clicked', function (event) {
            if (Number(store.default.state.Editable.index) >= 0 &&
                this.featureLookup[store.default.state.Editable.index] !== undefined) {
                this.featureLookup[store.default.state.Editable.index].forEach(element => {
                    if (element.deselect !== undefined) {
                        element.deselect();
                    }
                });
            }
            if (!this.editor.map.editTools.drawing()) {
                var hold = this.featureLookup[event.vertex.latlng.glueindex].filter(n => n instanceof L.HoldNode);
                if (hold.length > 0) {
                    hold[0].select();
                }
                var parking = this.featureLookup[event.vertex.latlng.glueindex].filter(n => n instanceof L.ParkingSpot);
                if (parking.length > 0) {
                    parking[0].selectParking();
                } else {
                    this.editLayer.featureLookup[event.vertex.latlng.glueindex].forEach
                    store.default.dispatch('setNode', event.vertex.latlng)
                    this.selectVertex(store.default.state.Editable.index)
                }
            }
        });
        var dragIndex = -1;
        this.on('editable:vertex:dragstart', function (event) {
            console.log("Drag Start : ", event.target);
            console.log("Middle Marker : ", event.vertex == event.vertex.middleMarker, event.vertex.latlng.glueindex == undefined);
            if (event.vertex.latlng.glueindex == undefined)
                return;
            console.log("Drag Start : ", event.vertex.latlng.glueindex);
            dragIndex = event.vertex.latlng.glueindex;
            if (Number(store.default.state.Editable.index) >= 0 &&
                this.featureLookup[store.default.state.Editable.index] !== undefined) {
                this.featureLookup[store.default.state.Editable.index].forEach(element => {
                    if (element.deselect !== undefined) {
                        element.deselect();
                    }
                });
            }
            if (!this.editor.map.editTools.drawing()) {
                var hold = this.featureLookup[event.vertex.latlng.glueindex].filter(n => n instanceof L.HoldNode);
                if (hold.length > 0) {
                    hold[0].select();
                }
                var parking = this.featureLookup[event.vertex.latlng.glueindex].filter(n => n instanceof L.ParkingSpot);
                if (parking.length > 0) {
                    parking[0].selectParking();
                } else {
                    this.selectVertex(Number(dragIndex))
                }
            }
        });
        this.on('editable:vertex:dragend', function (event) {
            console.log("Dragend : ", event.vertex);
            try {
                if (dragIndex > 0) {
                    event.target.featureLookup[dragIndex].forEach(element => {
                        if (element instanceof L.ParkingSpot) {
                            //element.setLatLng(event);
                            console.log(element);
                        }
                    });
                }
                dragIndex = -1;
                if (!event.vertex.latlng.glueindex) {
                    console.error('GlueIndex not found : ', event.vertex);
                }
                var parking = this.featureLookup[event.vertex.latlng.glueindex].filter(n => n instanceof L.ParkingSpot);
                if (parking.length > 0) {
                    parking[0].selectParking();
                } else {
                    if (Number(event.vertex.latlng.glueindex) !== store.default.state.Editable.index) {
                        if (Number(store.default.state.Editable.index) >= 0 &&
                            this.featureLookup[store.default.state.Editable.index] !== undefined) {
                            this.featureLookup[store.default.state.Editable.index].forEach(element => {
                                if (element.deselect !== undefined) {
                                    element.deselect();
                                }
                            });
                        }
                        store.default.dispatch('setNode', event.vertex.latlng)
                    }
                    var lines = this.featureLookup[event.vertex.latlng.glueindex].filter(n => n instanceof L.Polyline);
                    Vue.default.nextTick(function () {
                        lines.forEach(line => {
                            line.selectVertex(store.default.state.Editable.index)
                        });
                    })
                }
            } catch (error) {
                console.error(error);
                console.error(event.vertex.latlng.glueindex);
            }
        });
    };

    taxiwaySegment.__proto__.expandArc = function (attributes) {
        var isPushBackRoute = attributes.isPushBackRoute;
        var ids = [];
        var walkedNodes = [];
        var segmentIds = [];
        console.debug('start Walk');
        ids = ids.concat(this.walkPushbackRoute(attributes.begin, walkedNodes, isPushBackRoute));
        ids = ids.concat(this.walkPushbackRoute(attributes.end, walkedNodes, isPushBackRoute));
        return ids;
    }

    taxiwaySegment.__proto__.walkPushbackRoute = function (index, walkedNodes, isPushBackRoute) {
        console.debug('Walk Level');
        walkedNodes.push(index)
        var segmentIds = [];
        var polyLines = this.featureLookup[index].filter(n => n instanceof L.Polyline);
        if (polyLines === undefined || polyLines.length > 2) {
            console.debug('Walk ' + index + '\t' + polyLines.length);
            return;
        }

        polyLines.forEach(l => {
            segmentIds.push(l._leaflet_id);
            console.debug('Walk Next ' + index + '\t' +
                (walkedNodes.indexOf(index) < 0) + '\t' +
                l.begin + '\t' +
                (walkedNodes.indexOf(Number(l.begin)) < 0) + '\t' +
                l.end + '\t' +
                (walkedNodes.indexOf(Number(l.end)) < 0) + '\t' +
                l.options.attributes.direction + '\t' +
                l.options.attributes.begin + '\t' +
                l.options.attributes.end);
            console.debug('Walk isPushBackRoute ' + l.options.attributes.isPushBackRoute + '\t' + isPushBackRoute + '\t' + (l.options.attributes.isPushBackRoute === isPushBackRoute));
            if (l.options.attributes.isPushBackRoute === isPushBackRoute) {
                console.debug(Number(l.begin) === index && walkedNodes.indexOf(Number(l.end)) < 0);
                if (Number(l.begin) === index && walkedNodes.indexOf(Number(l.end)) < 0) {
                    console.debug('Walk forward ' + l.options.attributes.direction);
                    segmentIds = segmentIds.concat(this.walkPushbackRoute(Number(l.end), walkedNodes, isPushBackRoute))
                }
                console.debug(Number(l.end) === index && walkedNodes.indexOf(Number(l.begin)) < 0);
                if (Number(l.end) === index && walkedNodes.indexOf(Number(l.begin)) < 0) {
                    console.debug('Walk backward ' + l.options.attributes.direction);
                    segmentIds = segmentIds.concat(this.walkPushbackRoute(Number(l.begin), walkedNodes, isPushBackRoute))
                }
            }
        });
        return segmentIds;
    }

    /**
     * 
     */

    taxiwaySegment.__proto__.follow = function (dragIndex, event) {
        this.featureLookup[dragIndex].forEach(element => {
            if (element !== event.target) {
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
                else if (element instanceof L.Polyline) {
                    if (Number(element.begin) === Number(dragIndex)) {
                        element.getLatLngs()[0].update(event.latlng);
                        element.setLatLngs(element.getLatLngs());
                        element.updateBeginVertex(event.latlng);
                        element.updateMiddle();
                    }
                    if (Number(element.end) === Number(dragIndex)) {
                        element.getLatLngs()[element.getLatLngs().length - 1].update(event.latlng);
                        element.setLatLngs(element.getLatLngs());
                        element.updateEndVertex(event.latlng);
                        element.updateMiddle();
                    }
                } else if (element instanceof L.Editable.VertexMarker &&
                    element !== event.vertex) {
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
    };

    taxiwaySegment.__proto__.updateArrows = function (zoom) {
        if (this._map === null) {
            return;
        }
        if (this.options.attributes.direction === 'forward') {
            this.setText(null);
            if (zoom <= 16) {
                this.setText(' >', { repeat: true, offset: 6, attributes: { fill: 'red', style: 'vertical-align: bottom; vertical-align: bottom; font-weight: bold; font: bold 15px serif;' } })
            } else if (zoom <= 19) {
                this.setText(' > ', { repeat: true, offset: 7, attributes: { fill: 'red', style: 'vertical-align: bottom; vertical-align: bottom; font-weight: bold; font: bold 20px serif;' } })
            } else {
                this.setText('  >  ', { repeat: true, offset: 10, attributes: { fill: 'red', style: 'vertical-align: bottom; vertical-align: bottom; font-weight: bold; font: bold 30px serif;' } })
            }
        } else if (this.options.attributes.direction === 'backward') {
            this.setText(null);
            if (zoom <= 16) {
                this.setText(' <', { repeat: true, offset: 6, attributes: { fill: 'red', style: 'vertical-align: bottom; vertical-align: bottom; font-weight: bold; font: bold 15px serif;' } })
            } else if (zoom <= 19) {
                this.setText(' < ', { repeat: true, offset: 7, attributes: { fill: 'red', style: 'vertical-align: bottom; vertical-align: bottom; font-weight: bold; font: bold 20px serif;' } })
            } else {
                this.setText('  <  ', { repeat: true, offset: 10, attributes: { fill: 'red', style: 'vertical-align: bottom; vertical-align: bottom; font-weight: bold; font: bold 30px serif;' } })
            }
        } else {
            this.setText(null);
        }
    }

    taxiwaySegment.__proto__.setInteractive = function (interactive) {
        if (this.getLayers) {
            this.getLayers().forEach(layer => {
                layer.setInteractive(interactive);
            });
            return;
        }
        if (!this._path) {
            return;
        }

        this.options.interactive = interactive;

        if (interactive) {
            L.DomUtil.addClass(this._path, 'leaflet-interactive');
        } else {
            L.DomUtil.removeClass(this._path, 'leaflet-interactive');
        }
    };

    taxiwaySegment.__proto__.updateStyle = function () {
        var style = {};
        if (!this.options.attributes) {
            return;
        }
        if (this.options.attributes.selected) {
            style.color = 'red';
        } else if (this.options.attributes.isPushBackRoute) {
            style.color = 'magenta';
        }
        else {
            style.color = '#3388ff';
        }
        if (this.editEnabled()) {
            style.interactive = true;
        } else {
            style.interactive = false;
        }
        this.setStyle(style);
        if (this._map !== null) {
            if (this.options.attributes.direction === 'forward') {
                this.setText(null);
                this.setText('  >  ', { repeat: true, offset: 10, attributes: { fill: 'red', style: 'vertical-align: bottom; vertical-align: bottom; font-weight: bold; font: bold 30px serif;' } })
            } else if (this.options.attributes.direction === 'backward') {
                this.setText(null);
                this.setText('  <  ', { repeat: true, offset: 10, attributes: { fill: 'red', style: 'vertical-align: bottom; vertical-align: bottom; font-weight: bold; font: bold 30px serif;' } })
            } else {
                this.setText(null);
            }

        }
    };
};

exports.extendTaxiSegment = extendTaxiSegment;