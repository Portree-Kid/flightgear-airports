import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import createLogger from 'vuex/dist/logger'
import modules from './modules'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules,
  strict: debug,
  plugins: debug ? [createLogger(), createPersistedState({paths: ['Settings']})] : [createPersistedState({paths: ['Settings']})] // set logger only for development
})
