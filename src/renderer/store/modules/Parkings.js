import Vue from 'vue'

const state = { items: [] }

const mutations = {
  ADD_PARKING: (state, item) => {
    state.items.push(item)
  },
  UPDATE_PARKING: (state, item) => {
    const existingItem = state.items.find((i) => i.index === item.index)
    if (existingItem!==undefined) {
      Object.assign(existingItem, item)
    }
  },
  SET_PARKINGS (state, parkings) {
    Vue.set(state, 'items', parkings)
  }
}

const actions = {
  async addParking (context, p) {
    context.commit('ADD_FREADD_PARKINGQUENCY', p)
  },
  async updatedParking (context, p) {
    context.commit('UPDATE_PARKING', p)
  },
  async setParkings (context, parkings) {
    context.commit('SET_PARKINGS', parkings)
  }
}

export default {
  state,
  mutations,
  actions
}
