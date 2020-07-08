/* eslint-disable */
const state = {
  settings: { flightgearDirectory: '.', testDirectory: '.', email: 'flightgearairports@example.org', name: 'unknown', phi_url: 'http://localhost:8080' },
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
  'TEST_DIRECTORY' (state, testDirectory) {
    state.settings.testDirectory = testDirectory
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
  'SET_NAME' (state, name) {
    state.settings.name = name
  },
  'SET_PHI_URL' (state, phi_url) {
    state.settings.phi_url = phi_url
  }, 
  'SET_SCAN_LOGGING' (state, scanLogging) {
    state.settings.scanLogging = scanLogging
  },
  'ADD_WIP' (state, airport) {
    const item = state.wip.find((e) => e.icao === airport.icao)
    airport.time = Date.now()
    if (item === null || item === undefined) {
      state.wip.push(airport)
    } else {
      Object.assign(item, airport)
    }
    state.wip.sort((w1, w2) => w1.time - w2.time)
  },
  'UPLOAD_WIP' (state, icao) {
    const item = state.wip.find((e) => e.icao === icao)
    item.upload = Date.now()
    state.wip.sort((p, p2) => { return p.time - p2.time })
  },
  'REMOVE_WIP' (state, icao) {
    const item = state.wip.find((e) => e.icao === icao)
    const index = state.wip.indexOf(item)
    if (index > -1) {
      state.wip.splice(index, 1)
    }
  }
}

const plugins = []

const actions = {
  async setZoom (context, zoom) {
    context.commit('ZOOM', zoom)
  },
  async setCenter (context, center) {
    if( center.lat !== context.state.center.lat || center.lng !== context.state.center.lng) {
      context.commit('CENTER', center)
    }
  },
  async setBounds (context, bounds) {
    context.commit('BOUNDS', bounds)
  },
  async addWip (context, airport) {
    context.commit('ADD_WIP', airport)
  },
  async removeWip (context, icao) {
    context.commit('REMOVE_WIP', icao)
  }
}

export default {
  state,
  mutations,
  actions,
  plugins
}
