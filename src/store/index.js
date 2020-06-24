import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import sub from './modules/sub';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  getters: {
  },
  modules: {
    sub
  },
  strict: debug
});
