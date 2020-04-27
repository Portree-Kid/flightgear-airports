import Vue from 'vue'

const state = { items: [] }

const mutations = {
  ADD_FREQUENCY: (state, item) => {
    state.items.push(item)
  },
  UPDATE_FREQUENCY: (state, item) => {
    const existingItem = state.items.find((i) => i.id === item.id)
    Object.assign(existingItem, item)
  },
  REMOVE_FREQUENCY: (state, item) => {
    const index = state.items.indexOf(item)
    if (index > -1) {
      state.items.splice(index, 1)
    }
  },
  SET_FREQUENCIES (state, frequencies) {
    Vue.set(state, 'items', frequencies)
  }
}

const actions = {
  async addFrequency (context, frequency) {
    context.commit('ADD_FREQUENCY', frequency)
  },
  async updateFrequency (context, frequency) {
    context.commit('SET_GROUND', frequency)
  },
  async removeFrequency (context, frequency) {
    context.commit('REMOVE_FREQUENCY', frequency)
  },
  async setFrequencies (context, frequencies) {
    context.commit('SET_FREQUENCIES', frequencies)
  }
}

export default {
  state,
  mutations,
  actions
}
