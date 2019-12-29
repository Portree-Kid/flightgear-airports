const state = {
  type: 'airport',
  data: Object
}

const SET_EDIT_AIRPORT = 'SET_EDIT_AIRPORT'

const mutations = {
  SET_EDIT_AIRPORT (state, airport) {
    state.data = airport
    state.type = 'airport'
  }
}

const actions = {
  async setAirport (context, airport) {
    context.commit(SET_EDIT_AIRPORT, airport)
  }
}

export default {
  state,
  mutations,
  actions
}
