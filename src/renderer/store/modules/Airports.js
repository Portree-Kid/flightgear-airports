/* eslint-disable */
import idb from '../api/airports';
import Vue from 'vue';

const ADD_AIRPORT = 'ADD_AIRPORT';
const SET_AIRPORTS = 'SET_AIRPORTS';
const SET_UNFILTERED_AIRPORTS = 'SET_UNFILTERED_AIRPORTS';
const RESET_AIRPORTS = 'RESET_AIRPORTS';

const state = {
  airports: [], unfilteredairports:[]
}

const mutations = {
  'DELETE_INDEXED_DB' () { },
  ADD_AIRPORT (state, airports) {
    state.airports.push(airports);
  },
  SET_AIRPORTS (state, airports) {
    Vue.set(state, 'airports', airports);
  },
  SET_UNFILTERED_AIRPORTS (state, airports) {
    state.unfilteredairports = airports;
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
    try {
      context.commit(RESET_AIRPORTS);
      let airports = await idb.getAirports();
      context.commit(SET_AIRPORTS, airports
        .filter(point => typeof point.geometry.coordinates !== "undefined" )
        .filter(point => point.properties.flights > 0 ));        
    } catch (error) {
      console.error(error);
    }
  },
  async getAirportsUnfiltered(context) {
    try {
      context.commit(RESET_AIRPORTS);
      let airports = await idb.getAirports();
      context.commit(SET_UNFILTERED_AIRPORTS, airports
        .filter(point => typeof point.geometry.coordinates !== "undefined" ));
    } catch (error) {
      console.error(error);
    }
  },
  async saveAirport(context, airport) {
    await idb.saveAirport(airport);
  }}

export default {
  state,
  mutations,
  actions
}
