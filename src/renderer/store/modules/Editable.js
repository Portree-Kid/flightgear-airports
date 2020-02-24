import Vue from 'vue'

const state = {
  type: 'none',
  index: 'none',
  data: {airports: {}, parking: {}, arc: {}, node: {}}
}

const SET_EDIT_AIRPORT = 'SET_EDIT_AIRPORT'
const SET_EDIT_PARKING = 'SET_EDIT_PARKING'
const SET_EDIT_ARC = 'SET_EDIT_ARC'

const mutations = {
  SET_EDIT_AIRPORT (state, airport) {
    Vue.set(state.data, 'airport', airport)
    state.index = airport.icao
    state.type = 'airport'
  },
  SET_EDIT_PARKING (state, parking) {
    Vue.set(state, 'data', {})
    Vue.set(state.data, 'parking', parking)
    Vue.set(state, 'index', parking.index)
    Vue.set(state, 'type', 'parking')
  },
  'SET_EDIT_NODE' (state, node) {
    if (node === undefined) {
      return
    }
    Vue.set(state, 'data', {})
    Vue.set(state.data, 'node', node)
    Vue.set(state, 'index', node.index)
    Vue.set(state, 'type', 'node')
  },
  SET_EDIT_ARC (state, arc) {
    Vue.set(state, 'data', {})
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
  'SET_EDIT_PARKING_RADIUS' (state, radius) {
    Vue.set(state.data.parking, 'radius', radius)
  },
  'SET_EDIT_ARC_NAME' (state, arcName) {
    Vue.set(state.data.arc, 'name', arcName)
  },
  'SET_EDIT_PUSHBACK' (state, isPushBackRoute) {
    Vue.set(state.data.arc, 'isPushBackRoute', isPushBackRoute)
  },
  'SET_EDIT_HOLDPOINTTYPE' (state, holdPointType) {
    Vue.set(state.data.node, 'holdPointType', holdPointType)
  },
  'SET_EDIT_ISONRUNWAY' (state, isOnRunway) {
    Vue.set(state.data.node, 'isOnRunway', isOnRunway)
  }
}

const actions = {
  async setAirport (context, airport) {
    context.commit(SET_EDIT_AIRPORT, airport)
  },
  async setParking (context, parking) {
    context.commit(SET_EDIT_PARKING, parking)
  },
  async setArc (context, arc) {
    context.commit(SET_EDIT_ARC, arc)
  },
  async setNode (context, node) {
    context.commit('SET_EDIT_NODE', node)
  }
}

export default {
  state,
  mutations,
  actions
}
