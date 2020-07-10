/* eslint-disable */
import idb from '../api/airports';
import Vue from 'vue';

const ADD_AIRPORT = 'ADD_AIRPORT';
const SET_AIRPORTS = 'SET_AIRPORTS';
const SET_UNFILTERED_AIRPORTS = 'SET_UNFILTERED_AIRPORTS';
const RESET_AIRPORTS = 'RESET_AIRPORTS';
const SET_CURRENT_AIRPORT = 'SET_CURRENT_AIRPORT';
const UPDATE_CURRENT_AIRPORT = 'UPDATE_CURRENT_AIRPORT';

const state = {
  airports: [], unfilteredairports:[], currentAirport: {}
}

const mutations = {
  'DELETE_INDEXED_DB' () { },
  ADD_AIRPORT (state, airports) {
    airports.forEach(airport => {
      airport.properties.manual = true;
      idb.saveAirport(airport);
    });
    Vue.set(state, 'airports', state.airports.concat(airports));
  },
  'UPDATE_CURRENT_AIRPORT' (state, airport) {
    Vue.set(state, 'currentAirport', airport.properties);
    idb.saveAirport(airport);
  },
  SET_AIRPORTS (state, airports) {
    Vue.set(state, 'airports', airports);
  },
  SET_CURRENT_AIRPORT (state, airport) {
    Vue.set(state, 'currentAirport', airport);
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
        .filter(point => (point.properties.flights > 0 || point.properties.manual)));        
    } catch (error) {
      console.error(error);
    }
  },
  async addAirline(context, airlineCode) {
    try {
      airlineCode = airlineCode.toUpperCase()
      let airports = await idb.getAirports();
      let searchRegex = new RegExp(this.state.Airports.currentAirport.icao, 'i');
      let airport = airports
      .filter(point => typeof point.geometry.coordinates !== "undefined" )
      .filter(a => searchRegex.test(a.properties.icao));
      if (airport[0] !== undefined && !airport[0].properties.airlines.includes(airlineCode)) {
        airport[0].properties.airlines.push(airlineCode);
        airport[0].properties.airlines.sort();
      }
      context.commit(UPDATE_CURRENT_AIRPORT, airport[0]);            
    } catch (error) {
      console.error(error);      
    }
  },
  async setCurrentAirport(context, icao) {
    try {
      let airports = await idb.getAirports();
      let searchRegex = new RegExp(icao, 'i');
      let airport = airports
      .filter(point => typeof point.geometry.coordinates !== "undefined" )
      .filter(a => searchRegex.test(a.properties.icao));
      context.commit(SET_CURRENT_AIRPORT, airport[0].properties);      
    } catch (error) {
      console.error(error);      
    }
  },
  async getAirport(context, icao) {
    try {
      let airports = await idb.getAirports();
      let searchRegex = new RegExp(icao, 'i');
      let airport = airports
      .filter(point => typeof point.geometry.coordinates !== "undefined" )
      .filter(a => searchRegex.test(a.properties.icao));
      context.commit(ADD_AIRPORT, airport);
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
