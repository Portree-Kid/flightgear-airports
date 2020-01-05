const state = {
  type: 'none',
  index: 'none',
  data: {airports: {}, parking: {}, arc: {}}
}

const SET_EDIT_AIRPORT = 'SET_EDIT_AIRPORT'
const SET_EDIT_PARKING = 'SET_EDIT_PARKING'
const SET_EDIT_ARC = 'SET_EDIT_ARC'

const mutations = {
  SET_EDIT_AIRPORT (state, airport) {
    state.data.airports[airport.icao] = airport
    state.index = airport.icao
    state.type = 'airport'
  },
  SET_EDIT_PARKING (state, parking) {
    state.data.parking[parking.index] = parking
    state.index = parking.index
    state.type = 'parking'
  },
  SET_EDIT_ARC (state, arc) {
    state.data.arc = arc
    state.type = 'arc'
  },
  'SET_EDIT_PARKING_NAME' (state, parkingName) {
    state.data.name = parkingName
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
  }
}

export default {
  state,
  mutations,
  actions
}
