import createPersistedState from 'vuex-persistedstate'

const state = {
  settings: { flightgearDirectory: '.' }
}

const mutations = {
  'DELETE_INDEXED_DB' () { },
  'SETTINGS_DIRECTORY' (state, flightgearDirectory) {
    state.settings.flightgearDirectory = flightgearDirectory
  }
}

const plugins = [createPersistedState()]

const actions = {
}

export default {
  state,
  mutations,
  actions,
  plugins
}
