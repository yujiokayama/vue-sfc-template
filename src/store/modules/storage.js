// state
const state = {};

// mutations
const mutations = {};

// actions
const actions = {
  setStorage({ commit }, { key, val }) {
    window.sessionStorage.setItem(key, JSON.stringify(val));
  },
  getStorage({ commit }, key) {
    window.sessionStorage.getItem(key);
  }
};

// getters
const getters = {};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
