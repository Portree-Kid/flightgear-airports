const state = {
  settings: { flightgearDirectory: '.', email: 'x' },
  zoom: 14,
  center: [47.413220, -1.219482],
  bounds: undefined,
  wip: []
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
  'SET_EMAIL' (state, email) {
    state.settings.email = email
  },
  'ADD_WIP' (state, airport) {
    const item = state.wip.find((e) => e.icao === airport.icao)
    airport.time = Date.now()
    if (item === null) {
      state.wip.push(airport)
    } else {
      Object.assign(item, airport)
    }
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
  },
  async addWip (context, airport) {
    context.commit('ADD_WIP', airport)
  }
}

export default {
  state,
  mutations,
  actions,
  plugins
}
