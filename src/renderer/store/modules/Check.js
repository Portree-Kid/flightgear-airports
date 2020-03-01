const state = {
  results: []
}

const mutations = {
  'CHECK_RESULTS' (state, results) {
    state.results = results
  }
}

const plugins = []

const actions = {
  async setResults (context, results) {
    context.commit('CHECK_RESULTS', results)
  }
}

export default {
  state,
  mutations,
  actions,
  plugins
}
