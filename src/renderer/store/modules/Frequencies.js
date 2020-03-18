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
  async setFrequencies (context, frequencies) {
    context.commit('SET_FREQUENCIES', frequencies)
  }
}

export default {
  state,
  mutations,
  actions
}
