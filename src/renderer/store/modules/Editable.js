import Vue from 'vue'

const state = {
  type: 'none',
  index: 'none',
  editing: false,
  data: {airports: {}, parking: {}, arc: {}, node: {}, runway: {}}
}

const SET_EDIT_AIRPORT = 'SET_EDIT_AIRPORT'
const SET_EDIT_PARKING = 'SET_EDIT_PARKING'
const SET_EDIT_ARC = 'SET_EDIT_ARC'
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
    Vue.set(state.data.arc, 'name', arcName)
  },
  'SET_EDIT_PUSHBACK' (state, isPushBackRoute) {
    Vue.set(state.data.arc, 'isPushBackRoute', isPushBackRoute)
  },
  'SET_EDIT_DIRECTION' (state, direction) {
    Vue.set(state.data.arc, 'direction', direction)
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
  async setNode (context, node) {
    context.commit('SET_EDIT_NODE', node.attributes)
    context.commit('SET_EDIT_NODE_COORDS', node.lat.toFixed(5) + ' ' + node.lng.toFixed(5))
  }
}

export default {
  state,
  mutations,
  actions
}
