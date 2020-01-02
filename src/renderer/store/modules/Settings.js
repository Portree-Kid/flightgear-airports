const state = {
  settings: { flightgearDirectory: '.' },
  zoom: 14,
  center: [47.413220, -1.219482],
  bounds: undefined
}

const mutations = {
  'DELETE_INDEXED_DB' () { },
  'FLIGHTGEAR_DIRECTORY' (state, flightgearDirectory) {
    state.settings.flightgearDirectory = flightgearDirectory
    state.settings.flightgearDirectory_ai = flightgearDirectory + '/data/AI'
    state.settings.flightgearDirectory_apt = flightgearDirectory + '/data/Airports/apt.dat.gz'
  },
  'AIPORTS_DIRECTORY' (state, airportsDirectory) {
    state.settings.airportsDirectory = airportsDirectory
  },
  'ZOOM' (state, zoom) {
    state.zoom = zoom
  },
  'CENTER' (state, center) {
    state.center = center
  },
  'BOUNDS' (state, bounds) {
    state.bounds = bounds
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
