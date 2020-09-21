import Vue from 'vue'
import Vuex from 'vuex'
import sub from './modules/sub'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state: {
    formDestory: false,
    storage: {
      formID: null,
      display: false,
      userAgent: null,
      reference: null,
      circulation: 0,
      visited: [],
      useNavigation: false,
    },
  },
  mutations: {
    updateFormDestory(state, payload) {
      state.storage.formDestory = payload
    },
    updateFormID(state, payload) {
      state.storage.formID = payload
    },
    updateDisplay(state, payload) {
      state.storage.display = payload
    },
    updateUserAgent(state, payload) {
      state.storage.userAgent = payload
    },
    updateReference(state, payload) {
      state.storage.reference = payload
    },
    updateCirculation(state, payload) {
      state.storage.circulation = payload
    },
    updateVisited(state, payload) {
      state.storage.visited = payload
    },
    updateNavigation(state, payload) {
      state.storage.useNavigation = payload
    },
  },
  actions: {
    setFormScript({ state, commit, getters, dispatch }, payload) {
      const storage = state.storage
      if (!storage.display) {
        /**
         * patternA
         */
        if (storage.visited.match(/index/) && storage.circulation >= 3) {
          commit('updateFormID', 93)
          commit('updateDisplay', true)
          dispatch('setFormTag')
        } else if (storage.visited.match(/index/) && storage.circulation >= 5) {
          /**
           * patternB
           */
          commit('updateFormID', 94)
          commit('updateDisplay', true)
          dispatch('setFormTag')
        } else if (storage.useNavigation && storage.circulation >= 5) {
          /**
           * patternC
           */
          commit('updateDisplay', true)
          commit('updateFormID', 100)
          dispatch('setFormTag')
        } else if (
          storage.visited.match(
            /target|commerce|logstorage|others|function-list|ma-planning/
          )
        ) {
          /**
           * patternD
           */
          commit('updateDisplay', true)
          commit('updateFormID', 101)
          dispatch('setFormTag')
        } else if (storage.visited.match(/faq/)) {
          /**
           * patternE
           */
          commit('updateDisplay', true)
          commit('updateFormID', 102)
          dispatch('setFormTag')
        }
      }
    },
    setFormTag({ state }) {
      const storage = state.storage
      const script = document.createElement('script')
      script.src = `https://form.xdata.jp/form.js?site_id=500507&form_id=${storage.formID}`
      document.body.appendChild(script)
    },
    setUserAgent({ state, commit, getters, dispatch }, payload) {
      const userAgent = `${
        window.navigator.userAgent.match(/iPhone|Android.+Mobile/) ? 'sp' : 'pc'
      }`
      if (sessionStorage.getItem('xhmVisited')) {
        commit('updateUserAgent', JSON.stringify(userAgent))
      } else {
        sessionStorage.setItem('xhmUserAgent', JSON.stringify(userAgent))
        commit('updateUserAgent', JSON.stringify(userAgent))
      }
    },
    setReference({ state, commit, getters, dispatch }, payload) {
      const regPattern = new RegExp('google|yahoo|bing')
      if (sessionStorage.getItem('xhmReferer')) {
        commit('updateReference', JSON.stringify(referrer))
      } else {
        if (regPattern.test(document.referrer)) {
          const referrer = document.referrer.match(regPattern)
          commit('updateReference', JSON.stringify(referrer))
          sessionStorage.setItem('xhmReferer', JSON.stringify(referrer))
        }
      }
    },
    setCirculation({ state, commit, getters, dispatch }, payload) {
      const circulationCount = JSON.parse(state.storage.visited).length
      if (sessionStorage.getItem('xhmCirculation')) {
        commit('updateCirculation', JSON.stringify(circulationCount))
      }
      sessionStorage.setItem('xhmCirculation', JSON.stringify(circulationCount))
      commit('updateCirculation', JSON.stringify(circulationCount))
    },
    setVisited({ state, commit, getters, dispatch }, payload) {
      if (sessionStorage.getItem('xhmVisited')) {
        const visitedArray = JSON.parse(sessionStorage.getItem('xhmVisited'))
        if (document.URL.match(/index/) || location.pathname === '/') {
          visitedArray.push('index')
        } else {
          visitedArray.push(document.URL.split('/').slice(-2)[0])
        }
        sessionStorage.setItem(
          'xhmVisited',
          JSON.stringify(
            visitedArray.filter((v, i, a) => {
              return a.indexOf(v) === i
            })
          )
        )
      } else {
        const initArray = []
        if (document.URL.match(/index/) || location.pathname === '/') {
          initArray.push('index')
        } else {
          initArray.push(document.URL.split('/').slice(-2)[0])
        }
        sessionStorage.setItem('xhmVisited', JSON.stringify(initArray))
      }
      commit('updateVisited', sessionStorage.getItem('xhmVisited'))
    },
    setUseNavigation({ state, commit, getters, dispatch }, payload) {
      if (sessionStorage.getItem('xhmUseNavigation')) {
        commit('updateNavigation', true)
      }
      document.addEventListener('click', (event) => {
        if (!event.target.classList.contains('nav-link')) return
        sessionStorage.setItem('xhmUseNavigation', JSON.stringify(true))
        commit('updateNavigation', true)
      })
    },
    formDelete({ state, commit, getters, dispatch }, payload) {
      commit('updateDisplay', false)
      commit('updateFormDestory', true)
      sessionStorage.clear()
    },
  },
  getters: {},
  modules: {
    sub,
  },
  strict: debug,
})
