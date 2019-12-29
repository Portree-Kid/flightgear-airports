/* eslint-disable */
import idb from '../api/airports';

const ADD_AIRPORT = 'ADD_AIRPORT';
const SET_AIRPORTS = 'SET_AIRPORTS';
const RESET_AIRPORTS = 'RESET_AIRPORTS';

const state = {
  airports: []
}

const mutations = {
  'DELETE_INDEXED_DB' () { },
  ADD_AIRPORT (state, airports) {
    state.airports.push(airports);
  },
  SET_AIRPORTS (state, airports) {
    state.airports = airports;
  },
  RESET_AIRPORTS (state) {
    state.airports = [];
  },

}

const actions = {
  async deleteAirport(context, airport) {
    await idb.deleteAirport(airport); 
  },
  async getAirports(context) {
    context.commit(RESET_AIRPORTS);
    let airports = await idb.getAirports();
//    let newAirports = [];
//    airports.forEach(c => {
//      newAirports.push(c);
//    });
    context.commit(SET_AIRPORTS, airports
      .filter(point => typeof point.geometry.coordinates !== "undefined" )
      .filter(point => point.properties.flights > 0 ));
  },
  async saveAirport(context, airport) {
    await idb.saveAirport(airport);
  }}

export default {
  state,
  mutations,
  actions
}
