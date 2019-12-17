import Vue from 'vue'
import Vuex from 'vuex'
// import from 'electron-settings'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    settings: { flightgearDirectory: '.' }
  },
  actions: {
  },
  mutations: {
    'DELETE_INDEXED_DB' () {},
    'SETTINGS_DIRECTORY' (state, flightgearDirectory) {
      state.settings.flightgearDirectory = flightgearDirectory
    }
  },
  getters: {
    hydrated: state => state.hydrated
  },
  plugins: [createPersistedState()],
  strict: true
})
