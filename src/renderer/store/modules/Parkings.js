/*
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
*/

import Vue from 'vue'

const state = { items: [] }

const mutations = {
  ADD_PARKING: (state, item) => {
    state.items.push(item)
  },
  UPDATE_PARKING: (state, item) => {
    const existingItem = state.items.find((i) => i.index === item.index)
    if (existingItem !== undefined) {
      Object.assign(existingItem, item)
    }
  },
  SET_PARKINGS (state, parkings) {
    Vue.set(state, 'items', parkings)
  },
  'SET_EDIT_PARKING_ITEM_NAME' (state, value) {
    const existingItem = state.items.find((i) => i.index === value[0])
    Vue.set(existingItem, 'name', value[1])
  },
  'SET_EDIT_PARKING_ITEM_NUMBER' (state, value) {
    const existingItem = state.items.find((i) => i.index === value[0])
    Vue.set(existingItem, 'number', value[1])
  },
  'SET_EDIT_PARKING_ITEM_TYPE' (state, value) {
    const existingItem = state.items.find((i) => i.index === value[0])
    Vue.set(existingItem, 'type', value[1])
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
