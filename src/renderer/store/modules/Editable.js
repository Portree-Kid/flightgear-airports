/**
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
*/

import Vue from 'vue'

const state = {
  type: 'none',
  index: 'none',
  editing: false,
  data: {airports: {}, parking: {}, arc: {}, multiarc: {}, node: {}, runway: {}}
}

const SET_EDIT_AIRPORT = 'SET_EDIT_AIRPORT'
const SET_EDIT_PARKING = 'SET_EDIT_PARKING'
const SET_EDIT_ARC = 'SET_EDIT_ARC'
const SET_EDIT_MULTI_ARC = 'SET_EDIT_MULTI_ARC'
const SET_EDIT_RUNWAY = 'SET_EDIT_RUNWAY'

const mutations = {
  SET_EDIT_TYPE (state, type) {
    state.type = type
  },
  SET_EDIT (state, editing) {
    state.editing = editing
  },
  SET_EDIT_AIRPORT (state, airport) {
    Vue.set(state.data, 'airport', airport)
    state.index = airport.icao
    state.type = 'airport'
  },
  SET_EDIT_PARKING (state, parking) {
    Vue.set(state, 'data', {})
    var p = Object.assign({}, parking)
    Vue.set(state.data, 'parking', p)
    Vue.set(state, 'index', p.index)
    Vue.set(state, 'type', 'parking')
  },
  'SET_EDIT_NODE' (state, node) {
    if (node === undefined) {
      return
    }
    if (!state.data || state.type !== 'node') {
      Vue.set(state, 'data', {})
    }
    Vue.set(state.data, 'node', node)
    Vue.set(state, 'index', node.index)
    Vue.set(state, 'type', 'node')
  },
  SET_EDIT_RUNWAY (state, runway) {
    Vue.set(state, 'data', {})
    Vue.set(state.data, 'node', runway)
    Vue.set(state, 'index', runway.index)
    Vue.set(state, 'type', 'runway')
  },
  SET_EDIT_ARC (state, arc) {
    if (arc === undefined) {
      return
    }
    if (!state.data || state.type !== 'arc') {
      Vue.set(state, 'data', {})
    }
    Vue.set(state.data, 'arc', arc)
    if (state.data.arc.name === undefined) {
      Vue.set(state.data.arc, 'name', '')
    }
    Vue.set(state, 'index', arc.index)
    Vue.set(state, 'type', 'arc')
  },
  SET_EDIT_MULTI_ARC (state, arc) {
    if (arc === undefined) {
      return
    }
    if (!state.data || state.type !== 'multiarc') {
      Vue.set(state, 'data', {multiarc: {}})
    }
    Vue.set(state.data.multiarc, 'isPushBackRoute', arc.isPushBackRoute)
    Vue.set(state.data.multiarc, 'direction', arc.direction)
    if (state.data.multiarc.name === undefined) {
      Vue.set(state.data.multiarc, 'name', '')
    }
    Vue.set(state, 'index', arc.index)

    Vue.set(state, 'type', 'multiarc')
  },
  'SET_EDIT_MULTI_ARC_IDS' (state, arcs) {
    if (arcs === undefined) {
      return
    }
    if (!state.data || state.type !== 'multiarc') {
      return
    }
    if (state.data.multiarc.ids === undefined) {
      state.data.multiarc.ids = []
    }
    state.data.multiarc.ids = state.data.multiarc.ids.concat(arcs.filter(n => n).filter((v, i, a) => a.indexOf(v) === i))
  },
  'SET_EDIT_PARKING_NAME' (state, parkingName) {
    Vue.set(state.data.parking, 'name', parkingName)
  },
  'SET_EDIT_PARKING_NUMBER' (state, parkingName) {
    Vue.set(state.data.parking, 'number', parkingName)
  },
  'SET_EDIT_PARKING_HEADING' (state, heading) {
    while (heading >= 360) {
      heading -= 360
    }
    while (heading < 0) {
      heading += 360
    }

    Vue.set(state.data.parking, 'heading', heading)
  },
  'SET_EDIT_PARKING_AIRLINES' (state, airlineCodes) {
    Vue.set(state.data.parking, 'airlineCodes', airlineCodes)
  },
  'SET_EDIT_PARKING_TYPE' (state, type) {
    Vue.set(state.data.parking, 'type', type)
  },
  'SET_EDIT_PARKING_RADIUS' (state, radius) {
    Vue.set(state.data.parking, 'radius', radius)
  },
  'SET_EDIT_PARKING_COORDS' (state, coords) {
    Vue.set(state.data.parking, 'coords', coords)
  },
  'SET_EDIT_ARC_NAME' (state, arcName) {
    if (state.type === 'arc') {
      Vue.set(state.data.arc, 'name', arcName)
    } else {
      Vue.set(state.data.multiarc, 'name', arcName)
    }
  },
  'SET_EDIT_PUSHBACK' (state, isPushBackRoute) {
    if (state.type === 'arc') {
      Vue.set(state.data.arc, 'isPushBackRoute', Number(isPushBackRoute))
    } else {
      Vue.set(state.data.multiarc, 'isPushBackRoute', Number(isPushBackRoute))
    }
  },
  'SET_EDIT_DIRECTION' (state, direction) {
    if (state.type === 'arc') {
      Vue.set(state.data.arc, 'direction', direction)
    } else {
      Vue.set(state.data.multiarc, 'direction', direction)
    }
  },
  'SET_EDIT_HOLDPOINTTYPE' (state, holdPointType) {
    Vue.set(state.data.node, 'holdPointType', holdPointType)
  },
  'SET_EDIT_NODE_COORDS' (state, coords) {
    Vue.set(state.data.node, 'coords', coords)
  },
  'SET_EDIT_ISONRUNWAY' (state, isOnRunway) {
    Vue.set(state.data.node, 'isOnRunway', isOnRunway)
  }
}

const actions = {
  async setAirport (context, airport) {
    context.commit(SET_EDIT_AIRPORT, airport)
  },
  async setRunway (context, runway) {
    context.commit(SET_EDIT_RUNWAY, runway)
  },
  async setParking (context, parking) {
    context.commit(SET_EDIT_PARKING, parking)
  },
  async setParkingRadius (context, radius) {
    context.commit('SET_EDIT_PARKING_RADIUS', radius)
  },
  async setParkingHeading (context, heading) {
    context.commit('SET_EDIT_PARKING_HEADING', heading)
  },
  async setParkingCoords (context, coords) {
    context.commit('SET_EDIT_PARKING_COORDS', coords)
  },
  async setArc (context, arc) {
    context.commit(SET_EDIT_ARC, arc)
  },
  async setMultiArc (context, arc) {
    context.commit(SET_EDIT_MULTI_ARC, arc)
  },
  async setMultiArcIds (context, arc) {
    context.commit('SET_EDIT_MULTI_ARC_IDS', arc)
  },
  async setNode (context, node) {
    context.commit('SET_EDIT_NODE', node.attributes)
    context.commit('SET_EDIT_NODE_COORDS', node.lat.toFixed(6) + ' ' + node.lng.toFixed(6))
  }
}

export default {
  state,
  mutations,
  actions
}
