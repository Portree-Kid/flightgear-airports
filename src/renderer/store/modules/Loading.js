/*
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
*/

import Vue from 'vue'

const state = { groundnetLoaded: false, pavementLoaded: false }

const mutations = {
  SET_GROUNDNET_LOADED (state, loaded) {
    Vue.set(state, 'groundnetLoaded', loaded)
  },
  SET_PAVEMENT_LOADED (state, loaded) {
    Vue.set(state, 'pavementLoaded', loaded)
  }
}

const actions = {
  async setGroundnetLoaded (context, p) {
    context.commit('SET_GROUNDNET_LOADED', p)
  },
  async setPavementLoaded (context, p) {
    context.commit('SET_PAVEMENT_LOADED', p)
  }
}

export default {
  state,
  mutations,
  actions
}
