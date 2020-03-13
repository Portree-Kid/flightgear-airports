import Vue from 'vue'

const state = {
  'AWOS': 0,
  'GROUND': 0,
  'TOWER': 0,
  'APPROACH': 0
}

const mutations = {
  'SET_AWOS' (state, frequency) {
    Vue.set(state, 'AWOS', frequency)
  },
  'SET_GROUND' (state, frequency) {
    Vue.set(state, 'GROUND', frequency)
  },
  'SET_TOWER' (state, frequency) {
    Vue.set(state, 'TOWER', frequency)
  },
  'SET_APPROACH' (state, frequency) {
    Vue.set(state, 'APPROACH', frequency)
  },
  'SET_DEPARTURE' (state, frequency) {
    Vue.set(state, 'DEPARTURE', frequency)
  }
}

const actions = {
  async setAwos (context, frequency) {
    context.commit('SET_AWOS', frequency)
  },
  async setGround (context, frequency) {
    context.commit('SET_GROUND', frequency)
  },
  async setTower (context, frequency) {
    context.commit('SET_TOWER', frequency)
  },
  async setApproach (context, frequency) {
    context.commit('SET_APPROACH', frequency)
  },
  async setDeparture (context, frequency) {
    context.commit('SET_DEPARTURE', frequency)
  }
}

export default {
  state,
  mutations,
  actions
}
