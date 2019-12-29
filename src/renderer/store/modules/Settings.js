const state = {
  settings: { flightgearDirectory: '.' },
  zoom: 14,
  center: [47.413220, -1.219482]
}

const mutations = {
  'DELETE_INDEXED_DB' () { },
  'FLIGHTGEAR_DIRECTORY' (state, flightgearDirectory) {
    state.settings.flightgearDirectory = flightgearDirectory
  },
  'AIPORTS_DIRECTORY' (state, airportsDirectory) {
    state.settings.airportsDirectory = airportsDirectory
  },
  'ZOOM' (state, zoom) {
    state.zoom = zoom
  },
  'CENTER' (state, center) {
    state.center = center
  }

}

const plugins = []

const actions = {
}

export default {
  state,
  mutations,
  actions,
  plugins
}
