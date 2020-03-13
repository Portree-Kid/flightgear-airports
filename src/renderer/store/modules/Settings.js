const state = {
  settings: {flightgearDirectory: '.', name: ''},
  zoom: 14,
  center: [47.413220, -1.219482],
  bounds: undefined
}

const mutations = {
  'DELETE_INDEXED_DB' () { },
  'FLIGHTGEAR_DIRECTORY' (state, flightgearDirectory) {
    state.settings.flightgearDirectory = flightgearDirectory
    state.settings.flightgearDirectory_ai = flightgearDirectory + '/data/AI'
    state.settings.flightgearDirectory_traffic = flightgearDirectory + '/data/AI/Traffic'
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
  },
  'SET_USERNAME' (state, name) {
    state.settings.name = name
  }
}

const plugins = []

const actions = {
  async setZoom (context, zoom) {
    context.commit('ZOOM', zoom)
  },
  async setCenter (context, center) {
    context.commit('CENTER', center)
  },
  async setBounds (context, bounds) {
    context.commit('BOUNDS', bounds)
  }
}

export default {
  state,
  mutations,
  actions,
  plugins
}
