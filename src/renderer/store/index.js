import Vue from 'vue'
import Vuex from 'vuex'
// import from 'electron-settings'
// import the auto exporter
import createLogger from 'vuex/dist/logger'
import modules from './modules'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules,
  strict: debug,
  plugins: debug ? [createLogger()] : [] // set logger only for development
})
